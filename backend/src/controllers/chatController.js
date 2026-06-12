import { buildChatMessages } from "../services/promptService.js";
import { askLmStudio } from "../services/lmStudioService.js";
import { parseAssistantResponse } from "../services/responseParserService.js";
import { createAppointment, updateAppointment } from "../services/appointmentService.js";
import { handleBookingFlow } from "../services/bookingFlowService.js";
import {
  buildSafeFallbackReply,
  enrichNumericServiceSelection,
  getPreflightChatReply
} from "../services/chatRuleService.js";
import { normalizeChatRequest } from "../services/chatRequestService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const chat = asyncHandler(async (req, res) => {
  const { userMessage, history, conversationId, activeAppointmentId } = normalizeChatRequest(req.body);

  const bookingFlow = await handleBookingFlow({ userMessage, history, conversationId, activeAppointmentId });
  if (bookingFlow?.handled) {
    res.json({
      success: true,
      reply: bookingFlow.reply,
      saved: bookingFlow.saved,
      appointment: bookingFlow.appointment,
      resetActiveAppointment: Boolean(bookingFlow.resetActiveAppointment)
    });
    return;
  }

  const preflightReply = getPreflightChatReply({ userMessage, history });
  if (preflightReply) {
    res.json({
      success: true,
      reply: preflightReply,
      saved: false,
      appointment: null,
      resetActiveAppointment: false
    });
    return;
  }

  const enrichedUserMessage = enrichNumericServiceSelection(userMessage, history);
  const messages = buildChatMessages({ history, userMessage: enrichedUserMessage });
  let rawAssistantResponse;

  try {
    rawAssistantResponse = await askLmStudio(messages);
  } catch (error) {
    res.json({
      success: true,
      reply: buildSafeFallbackReply({ userMessage }),
      saved: false,
      appointment: null,
      resetActiveAppointment: false,
      degraded: true,
      reason: error.code || "LMSTUDIO_UNAVAILABLE"
    });
    return;
  }

  const parsed = parseAssistantResponse(rawAssistantResponse);

  let appointment = null;
  let saved = false;
  let reply = parsed.reply || buildSafeFallbackReply({ userMessage });

  if (parsed.appointmentCandidate && !conversationHasExplicitTime([...history, { role: "user", content: userMessage }])) {
    reply = "Perfecto, ya tengo casi todo. ¿A que hora te viene bien? Abrimos de lunes a viernes de 10:00 a 20:00.";
  } else if (parsed.appointmentCandidate) {
    try {
      const payload = {
        ...parsed.appointmentCandidate,
        conversationId
      };

      appointment = activeAppointmentId
        ? await updateAppointment(
            activeAppointmentId,
            { ...payload, source: "chat" },
            { expectedConversationId: conversationId }
          )
        : await createAppointment(payload, "chat");

      saved = true;
    } catch (error) {
      reply = buildBusinessValidationReply(error);
    }
  }

  res.json({
    success: true,
    reply,
    saved,
    appointment,
    resetActiveAppointment: false
  });
});

function buildBusinessValidationReply(error) {
  if (error.code === "SLOT_UNAVAILABLE") {
    return `${error.message} Dime otra hora y te la miro encantado.`;
  }

  if (error.code === "WEEKEND_CLOSED") {
    return `${error.message} ¿Te vendria bien el viernes anterior o el lunes siguiente?`;
  }

  if (error.code === "INVALID_CUSTOMER_NAME") {
    return "¡Claro! ¿A nombre de quién pongo la reserva?";
  }

  if (error.code === "OUTSIDE_BUSINESS_HOURS") {
    return "Ese horario no permite terminar el servicio antes del cierre. Abrimos de lunes a viernes de 10:00 a 20:00.";
  }

  if (error.code === "PAST_DATETIME") {
    return error.message;
  }

  return "Tengo los datos, pero ahora mismo no he podido guardar la cita. No la doy por confirmada; inténtalo de nuevo en unos instantes.";
}

function conversationHasExplicitTime(history) {
  const joined = history
    .slice(-10)
    .filter((message) => message.role === "user")
    .map((message) => String(message.content || "").toLowerCase())
    .join(" ");

  return /\b(?:a las|las|hora)\s+[0-2]?\d(?::[0-5]\d)?\b/.test(joined) || /\b[0-2]?\d:[0-5]\d\b/.test(joined);
}
