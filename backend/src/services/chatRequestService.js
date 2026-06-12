import { AppError } from "../utils/AppError.js";

export const MAX_CHAT_MESSAGE_LENGTH = 1200;
export const MAX_CHAT_HISTORY_ITEMS = 24;
const MAX_HISTORY_CONTENT_LENGTH = 1200;
const MAX_CONVERSATION_ID_LENGTH = 120;
const MAX_APPOINTMENT_ID_LENGTH = 64;

export function normalizeChatRequest(body = {}) {
  const userMessage = normalizeMessage(body.message);
  if (!userMessage) {
    throw new AppError("El mensaje no puede estar vacio", 400, "EMPTY_MESSAGE");
  }

  if (userMessage.length > MAX_CHAT_MESSAGE_LENGTH) {
    throw new AppError(
      `El mensaje es demasiado largo. El maximo es de ${MAX_CHAT_MESSAGE_LENGTH} caracteres.`,
      400,
      "MESSAGE_TOO_LONG"
    );
  }

  return {
    userMessage,
    history: normalizeHistory(body.history),
    conversationId: normalizeIdentifier(body.conversationId, MAX_CONVERSATION_ID_LENGTH),
    activeAppointmentId: normalizeIdentifier(body.activeAppointmentId, MAX_APPOINTMENT_ID_LENGTH) || null
  };
}

function normalizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) {
    return [];
  }

  return rawHistory
    .filter((item) => item && ["user", "assistant"].includes(item.role))
    .map((item) => ({
      role: item.role,
      content: normalizeMessage(item.content).slice(0, MAX_HISTORY_CONTENT_LENGTH)
    }))
    .filter((item) => item.content)
    .slice(-MAX_CHAT_HISTORY_ITEMS);
}

function normalizeMessage(value) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function normalizeIdentifier(value, maxLength) {
  return String(value ?? "")
    .replace(/[^\w-]/g, "")
    .slice(0, maxLength);
}
