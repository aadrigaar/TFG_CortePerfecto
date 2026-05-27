import { buildChatMessages } from "../services/promptService.js";
import { askLmStudio } from "../services/lmStudioService.js";
import { parseAssistantResponse } from "../services/responseParserService.js";
import { createAppointment, updateAppointment } from "../services/appointmentService.js";
import { handleBookingFlow } from "../services/bookingFlowService.js";
import { enrichNumericServiceSelection, getPreflightChatReply } from "../services/chatRuleService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const chat = asyncHandler(async (req, res) => {
  const userMessage = String(req.body.message || "").trim();
  const history = Array.isArray(req.body.history) ? req.body.history : [];
  const conversationId = String(req.body.conversationId || "");
  const activeAppointmentId = req.body.activeAppointmentId || null;

  if (!userMessage) {
    throw new AppError("El mensaje no puede estar vacio", 400, "EMPTY_MESSAGE");
  }

  const bookingFlow = await handleBookingFlow({ userMessage, history, conversationId, activeAppointmentId });
  if (bookingFlow?.handled) {
    res.json({
      success: true,
      reply: bookingFlow.reply,
      saved: bookingFlow.saved,
      appointment: bookingFlow.appointment
    });
    return;
  }

  const preflightReply = getPreflightChatReply({ userMessage, history });
  if (preflightReply) {
    res.json({
      success: true,
      reply: preflightReply,
      saved: false,
      appointment: null
    });
    return;
  }

  const enrichedUserMessage = enrichNumericServiceSelection(userMessage, history);
  const messages = buildChatMessages({ history, userMessage: enrichedUserMessage });
  const rawAssistantResponse = await askLmStudio(messages);
  const parsed = parseAssistantResponse(rawAssistantResponse);

  let appointment = null;
  let saved = false;
  let reply = parsed.reply || "Perdona, no te he entendido bien. ¿Me lo repites?";

  if (parsed.appointmentCandidate && !conversationHasExplicitTime([...history, { role: "user", content: userMessage }])) {
    reply = "Perfecto, ya tengo casi todo. ¿A que hora te viene bien? Abrimos de lunes a viernes de 10:00 a 20:00.";
  } else if (parsed.appointmentCandidate) {
    try {
      const payload = {
        ...parsed.appointmentCandidate,
        conversationId
      };

      appointment = activeAppointmentId
        ? await updateAppointment(activeAppointmentId, { ...payload, source: "chat" })
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
    appointment
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
    return "Ese horario queda fuera de nuestra jornada. Abrimos de lunes a viernes de 10:00 a 20:00.";
  }

  if (error.code === "PAST_DATETIME") {
    return error.message;
  }

  return "Casi lo tengo, pero necesito que me confirmes nombre, servicio, dia y hora para dejar la cita bien registrada.";
}

function conversationHasExplicitTime(history) {
  const joined = history
    .slice(-10)
    .filter((message) => message.role === "user")
    .map((message) => String(message.content || "").toLowerCase())
    .join(" ");

  return /\b(?:a las|las|hora)\s+[0-2]?\d(?::[0-5]\d)?\b/.test(joined) || /\b[0-2]?\d:[0-5]\d\b/.test(joined);
}
