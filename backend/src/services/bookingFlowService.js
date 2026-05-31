import { createAppointment, updateAppointment } from "./appointmentService.js";
import {
  addDays,
  formatMadridTime,
  formatShortSpanishDate,
  getWeekdayName,
  isWeekendDate,
  madridNow,
  toDateInput
} from "./calendarService.js";
import { formatNumberedServices, getServiceByOption, normalizeText, resolveService } from "../config/serviceCatalog.js";

const INVALID_NAMES = new Set([
  "so",
  "si",
  "sí",
  "ok",
  "vale",
  "yo",
  "asdf",
  "test",
  "prueba",
  "nada",
  "sin nombre",
  "anonimo",
  "anónimo"
]);

const WEEKDAY_INDEX = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
};

const MONTH_INDEX = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
};

export async function handleBookingFlow({ userMessage, history = [], conversationId, activeAppointmentId }) {
  if (isCancellationRequest(userMessage)) {
    return handleCancellationRequest(activeAppointmentId);
  }

  if (isPoliteStopRequest(userMessage)) {
    return {
      handled: true,
      reply: "¡Entendido! Si me necesitas para otra cosa, aquí estaré. ¡Buen día!",
      saved: false,
      appointment: null
    };
  }

  const serviceDetail = getServiceDetailReply(userMessage, history);
  if (serviceDetail) {
    return serviceDetail;
  }

  if (isInformationInterrupt(userMessage)) {
    return null;
  }

  const resetInfo = getResetContextInfo(userMessage, history);
  const effectiveHistory = resetInfo.shouldResetNow ? [] : resetInfo.history;
  const shouldIgnoreActiveAppointment = resetInfo.shouldResetNow || resetInfo.isUnconfirmedResetContext;
  const messages = [...effectiveHistory, { role: "user", content: userMessage }];
  const context = buildBookingContext(messages);

  if (!context.isBookingFlow) {
    return null;
  }

  if (isInvalidServiceOption(userMessage, effectiveHistory)) {
    return {
      handled: true,
      reply: `Esa opción no existe. Elige un número del 1 al 7:\n${formatNumberedServices()}`,
      saved: false,
      appointment: null,
      resetActiveAppointment: shouldIgnoreActiveAppointment
    };
  }

  if (isSummaryRequest(userMessage)) {
    return buildSummaryResponse(context, shouldIgnoreActiveAppointment);
  }

  const missingChangeReply = buildMissingChangeReply(userMessage, effectiveHistory, messages, shouldIgnoreActiveAppointment);
  if (missingChangeReply) {
    return missingChangeReply;
  }

  if (context.date && isPastDate(context.date.date)) {
    return buildPastDateResponse(context.date.date, shouldIgnoreActiveAppointment);
  }

  if (context.service && context.date && isWeekendDate(context.date.date)) {
    return buildWeekendResponse(context.date.date, shouldIgnoreActiveAppointment);
  }

  if (context.date && context.time && isPastDateTime(context.date.date, context.time)) {
    return buildPastDateTimeResponse(shouldIgnoreActiveAppointment);
  }

  if (!context.customerName) {
    return {
      handled: true,
      reply: "¡Claro! ¿A nombre de quién pongo la reserva?",
      saved: false,
      appointment: null,
      resetActiveAppointment: shouldIgnoreActiveAppointment
    };
  }

  if (!context.service) {
    return {
      handled: true,
      reply: `Perfecto, ${context.customerName}. ¿Qué servicio quieres? Puedes responder solo con el numero:\n${formatNumberedServices()}`,
      saved: false,
      appointment: null,
      resetActiveAppointment: shouldIgnoreActiveAppointment
    };
  }

  if (!context.date) {
    return {
      handled: true,
      reply: `Genial, ${context.customerName}. Has elegido ${context.service.label}. ¿Qué día te viene bien?`,
      saved: false,
      appointment: null,
      resetActiveAppointment: shouldIgnoreActiveAppointment
    };
  }

  if (isWeekendDate(context.date.date)) {
    return buildWeekendResponse(context.date.date, shouldIgnoreActiveAppointment);
  }

  if (!context.time) {
    return {
      handled: true,
      reply: `Perfecto, para el ${formatShortSpanishDate(context.date.date)}. ¿A qué hora te viene bien? Abrimos de lunes a viernes de 10:00 a 20:00.`,
      saved: false,
      appointment: null,
      resetActiveAppointment: shouldIgnoreActiveAppointment
    };
  }

  const payload = {
    customerName: context.customerName,
    service: context.service.label,
    date: toDateInput(context.date.date),
    time: context.time.value,
    conversationId
  };

  try {
    const appointment = activeAppointmentId && !shouldIgnoreActiveAppointment
      ? await updateAppointment(activeAppointmentId, { ...payload, source: "chat" })
      : await createAppointment(payload, "chat");

    return {
      handled: true,
      reply: `¡Perfecto, ${appointment.customerName}! Te apunto el ${formatShortSpanishDate(new Date(`${appointment.date}T12:00:00`))} a las ${appointment.time} para ${appointment.service}. ¡Hasta entonces!`,
      saved: true,
      appointment,
      resetActiveAppointment: shouldIgnoreActiveAppointment
    };
  } catch (error) {
    return {
      handled: true,
      reply: buildValidationReply(error),
      saved: false,
      appointment: null,
      resetActiveAppointment: shouldIgnoreActiveAppointment
    };
  }
}

function getServiceDetailReply(userMessage, history) {
  const service = parseServiceReference(userMessage, history);
  const text = normalizeText(userMessage);

  const isAskingDetail = service && (isServiceDetailRequest(text) || isServiceDetailFollowUpRequest(text, history));

  if (!isAskingDetail) {
    return null;
  }

  return {
    handled: true,
    reply: `${describeService(service)}\n\n¿Quieres reservar esta opción?`,
    saved: false,
    appointment: null
  };
}

function isServiceDetailFollowUpRequest(text, history) {
  if (!hasRecentServiceDetailContext(history)) {
    return false;
  }

  if (/\b(quiero|elijo|prefiero|mejor|ponme|reservame|reserva|cambio|cambialo)\b/.test(text)) {
    return false;
  }

  return /\b(?:y\s+)?(?:la|el)\s+(?:(?:opcion|opicon)\s*)?[1-7]\b/.test(text);
}

function hasRecentServiceDetailContext(history) {
  const recent = history
    .slice(-4)
    .map((message) => normalizeText(message.content || ""))
    .join(" ");

  return (
    recent.includes("quieres reservar esta opcion") ||
    recent.includes("cuesta") ||
    recent.includes("dura unos") ||
    recent.includes("de que va") ||
    recent.includes("en que consiste")
  );
}

function isInformationInterrupt(message) {
  const text = normalizeText(message);
  if (!text) {
    return false;
  }

  return [
    "vuelve a darme",
    "dame las opciones",
    "dame opciones",
    "dame la informacion",
    "quiero mas informacion",
    "mas informacion",
    "informacion",
    "servicios",
    "tarifas",
    "precios",
    "catalogo",
    "que teneis",
    "que haceis",
    "opciones",
    "horario",
    "hora abris",
    "cuando abris",
    "apertura",
    "esta abierto",
    "abierto"
  ].some((keyword) => text.includes(keyword));
}

function isCancellationRequest(message) {
  const text = normalizeText(message);
  return /\b(cancelar|cancela|cancelame|anular|anula|borra|elimina)\b/.test(text);
}

async function handleCancellationRequest(activeAppointmentId) {
  if (!activeAppointmentId) {
    return {
      handled: true,
      reply: "Entendido, dejo la reserva sin hacer. Si necesitas otra cosa, aquí estaré.",
      saved: false,
      appointment: null,
      resetActiveAppointment: true
    };
  }

  try {
    await updateAppointment(activeAppointmentId, { status: "cancelled", source: "chat" });
    return {
      handled: true,
      reply: "He cancelado tu cita. Si necesitas reservar otra, dime el servicio y te ayudo.",
      saved: false,
      appointment: null,
      resetActiveAppointment: true
    };
  } catch {
    return {
      handled: true,
      reply: "No he podido encontrar esa cita activa para cancelarla. Si quieres, puedo ayudarte a reservar otra.",
      saved: false,
      appointment: null,
      resetActiveAppointment: true
    };
  }
}

function isPoliteStopRequest(message) {
  const text = normalizeText(message);

  if (!text || text.includes("quiero") || text.includes("mejor") || text.includes("opcion") || /\b[1-7]\b/.test(text)) {
    return false;
  }

  return /^(no|no gracias|nada|ninguna|gracias|vale gracias|ok gracias|de momento no|ya no|mejor no|lo dejo)$/.test(text);
}

function isSummaryRequest(message) {
  const text = normalizeText(message);
  return (
    text.includes("resumen") ||
    text.includes("confirmacion") ||
    text.includes("que tengo reservado") ||
    text.includes("mi reserva") ||
    text.includes("mi cita")
  );
}

function buildMissingChangeReply(userMessage, history, messages, resetActiveAppointment = false) {
  const changeRequest = getChangeRequest(userMessage);
  if (!changeRequest) {
    return null;
  }

  const text = normalizeText(userMessage);
  const previousAssistant = findPreviousAssistant(messages, messages.length - 1);
  const messageHasService = Boolean(parseServiceReference(userMessage, previousAssistant ? [previousAssistant] : history.slice(-2)));
  const messageHasDate = Boolean(
    parseDateReference(userMessage, {
      allowPureDay: isDateContext(previousAssistant),
      serviceContext: false,
      referenceMonthDate: findRecentMonthDate(messages, messages.length - 1)
    })
  );
  const messageHasTime = Boolean(parseTimeReference(userMessage, { allowPureTime: isTimeContext(previousAssistant) }));
  const messageHasName = Boolean(parseExplicitName(userMessage)) || Boolean(text.match(/\bnombre\s+(?:a\s+)?[a-zA-ZÀ-ÿñÑ\s'-]{2,80}/));
  const hasAnyNewValue = messageHasService || messageHasDate || messageHasTime || messageHasName;

  if (changeRequest.service && !messageHasService) {
    return buildPendingChangeReply(
      `Claro. ¿A qué servicio quieres cambiar? Puedes responder solo con el número:\n${formatNumberedServices()}`,
      resetActiveAppointment
    );
  }

  if (changeRequest.date && !messageHasDate) {
    return buildPendingChangeReply("Claro. ¿Qué nuevo día te viene bien?", resetActiveAppointment);
  }

  if (changeRequest.time && !messageHasTime) {
    return buildPendingChangeReply(
      "Claro. ¿A qué nueva hora te viene bien? Abrimos de lunes a viernes de 10:00 a 20:00.",
      resetActiveAppointment
    );
  }

  if (changeRequest.name && !messageHasName) {
    return buildPendingChangeReply("Claro. ¿A qué nombre quieres poner la reserva?", resetActiveAppointment);
  }

  if (changeRequest.generic && !hasAnyNewValue) {
    return buildPendingChangeReply("Claro. ¿Qué quieres cambiar: servicio, día, hora o nombre?", resetActiveAppointment);
  }

  return null;
}

function getChangeRequest(message) {
  const text = normalizeText(message);
  const hasChangeVerb = /\b(cambia|cambiar|cambiame|modifica|modificar|mueve|mover|reprograma|reprogramar|adelanta|adelantar|retrasa|retrasar)\b/.test(text);

  if (!hasChangeVerb) {
    return null;
  }

  const service = /\b(servicio|opcion|opicon|corte|tinte|peinado)\b/.test(text);
  const date =
    /\b(dia|fecha|lunes|martes|miercoles|jueves|viernes|sabado|domingo|hoy|manana|pasado manana|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/.test(
      text
    ) || /\b[0-3]?\d[/-][01]?\d\b/.test(text);
  const time = /\b(hora|a las|las|[0-2]?\d[:.h][0-5]\d|tarde|noche)\b/.test(text);
  const name = /\b(nombre|a nombre de)\b/.test(text);
  const generic = /\b(cita|reserva)\b/.test(text) && !service && !date && !time && !name;

  return {
    service,
    date,
    time,
    name,
    generic
  };
}

function buildPendingChangeReply(reply, resetActiveAppointment = false) {
  return {
    handled: true,
    reply,
    saved: false,
    appointment: null,
    resetActiveAppointment
  };
}

function buildBookingContext(messages) {
  const userMessages = messages.filter((message) => message.role === "user");
  const lastUserMessage = userMessages.at(-1)?.content || "";
  const lastText = normalizeText(lastUserMessage);

  const customerName = findCustomerName(messages);
  const service = findLatestService(messages);
  const date = findLatestDate(messages);
  const time = findLatestTime(messages);
  const isBookingFlow =
    hasBookingIntent(lastText) ||
    isNewBookingRequest(lastText) ||
    isSummaryRequest(lastText) ||
    isServiceSelectionInCurrentContext(messages) ||
    hasBookingContext(messages) ||
    Boolean((customerName || service || date || time) && hasRecentBookingContext(messages));

  return {
    customerName,
    service,
    date,
    time,
    isBookingFlow
  };
}

function hasBookingIntent(text) {
  return ["cita", "reserv", "apuntame", "turno", "hueco", "agendar", "cambiar", "cambia"].some((keyword) =>
    text.includes(keyword)
  );
}

function hasBookingContext(messages) {
  const recent = messages
    .slice(-8)
    .map((message) => normalizeText(message.content || ""))
    .join(" ");

  return [
    "a nombre de quien",
    "que servicio",
    "cual te interesa",
    "que dia",
    "que fecha",
    "a que hora",
    "te viene bien",
    "quieres reservar"
  ].some((keyword) => recent.includes(keyword));
}

function hasRecentBookingContext(messages) {
  const recent = messages
    .slice(-12)
    .map((message) => normalizeText(message.content || ""))
    .join(" ");

  return hasBookingIntent(recent) || hasBookingContext(messages);
}

function isServiceSelectionInCurrentContext(messages) {
  const lastUserIndex = findLastUserIndex(messages, () => true);
  if (lastUserIndex < 0) {
    return false;
  }

  const previousAssistant = findPreviousAssistant(messages, lastUserIndex);
  return (
    !isDateContext(previousAssistant) &&
    !isTimeContext(previousAssistant) &&
    isServiceContext(previousAssistant ? [previousAssistant] : []) &&
    isServiceSelectionText(messages[lastUserIndex].content)
  );
}

function isNewBookingRequest(message) {
  const text = normalizeText(message);

  return (
    text.includes("otra cita") ||
    text.includes("otra reserva") ||
    text.includes("nueva cita") ||
    text.includes("nueva reserva") ||
    text.includes("empezar de nuevo") ||
    text.includes("empecemos de nuevo")
  );
}

function getResetContextInfo(userMessage, history) {
  const shouldResetNow = isNewBookingRequest(userMessage);

  if (shouldResetNow) {
    return {
      shouldResetNow: true,
      isUnconfirmedResetContext: true,
      history: []
    };
  }

  const lastResetIndex = findLastUserIndex(history, (content) => isNewBookingRequest(content));
  if (lastResetIndex < 0) {
    return {
      shouldResetNow: false,
      isUnconfirmedResetContext: false,
      history
    };
  }

  const scopedHistory = history.slice(lastResetIndex);
  const hasConfirmationAfterReset = scopedHistory.some((message) => {
    return message.role === "assistant" && normalizeText(message.content || "").includes("te apunto");
  });

  return {
    shouldResetNow: false,
    isUnconfirmedResetContext: !hasConfirmationAfterReset,
    history: scopedHistory
  };
}

function findLastUserIndex(messages, predicate) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "user" && predicate(messages[index].content || "")) {
      return index;
    }
  }

  return -1;
}

function findCustomerName(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }

    const explicitName = parseExplicitName(message.content);
    if (explicitName) {
      return explicitName;
    }

    const previousAssistant = findPreviousAssistant(messages, index);
    if (previousAssistant && normalizeText(previousAssistant.content).includes("nombre")) {
      const candidate = cleanName(message.content);
      if (isValidName(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function parseExplicitName(message) {
  const match = String(message || "").trim().match(/\b(?:me llamo|soy|a nombre de|nombre es)\s+([a-zA-ZÀ-ÿñÑ\s'-]{2,80})/i);
  return match ? cleanName(match[1]) : null;
}

function cleanName(rawName) {
  return String(rawName || "")
    .replace(/[.!,?¿¡]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidName(name) {
  const normalized = normalizeText(name);
  return Boolean(name && name.length >= 2 && /^[a-zA-ZÀ-ÿñÑ\s'-]+$/.test(name) && !INVALID_NAMES.has(normalized));
}

function findLatestService(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }

    const previousAssistant = findPreviousAssistant(messages, index);
    if (isDateContext(previousAssistant) || isTimeContext(previousAssistant)) {
      continue;
    }

    const service = parseServiceReference(message.content, previousAssistant ? [previousAssistant] : []);
    if (service) {
      return service;
    }
  }

  return null;
}

function parseServiceReference(message, history = []) {
  const text = normalizeText(message);

  const optionMatch =
    text.match(/\b(?:opcion|opicon|servicio|numero|nº|n)\s*([1-7])\b/) ||
    text.match(/\bde que\s+(?:va|iba|trata|trataba)\s+(?:(?:la\s+)?(?:opcion|opicon)\s+|la\s+|el\s+)?([1-7])\b/) ||
    text.match(/\ben que consiste\s+(?:(?:la\s+)?(?:opcion|opicon)\s+|la\s+|el\s+)?([1-7])\b/) ||
    text.match(/\bhablame\s+(?:sobre|del|de la)?\s*(?:(?:opcion|opicon)\s*)?([1-7])\b/) ||
    (isServiceContext(history) ? text.match(/^\s*([1-7])(?:\s+por favor)?\s*$/) : null) ||
    (isServiceContext(history)
      ? text.match(/\b(?:quiero|elijo|prefiero|mejor|ponme|reservame|cambio a|cambialo a|la|el|y)\s+(?:la\s+|el\s+)?(?:(?:opcion|opicon)\s*)?([1-7])\b/)
      : null);

  if (optionMatch) {
    return getServiceByOption(optionMatch[1]);
  }

  return resolveService(message);
}

function isInvalidServiceOption(message, history) {
  const text = normalizeText(message);
  const previousAssistant = findPreviousAssistant(history, history.length);

  if (isDateContext(previousAssistant) || isTimeContext(previousAssistant) || looksLikeDateReference(text)) {
    return false;
  }

  const hasOptionNumber =
    text.match(/\b(?:opcion|opicon|servicio|numero|nº|n)\s*(\d+)\b/) ||
    (isServiceContext(history) ? text.match(/^\s*(\d+)(?:\s+por favor)?\s*$/) : null) ||
    (isServiceContext(history)
      ? text.match(/\b(?:quiero|elijo|prefiero|mejor|ponme|reservame|cambio a|cambialo a|la|el)\s+(?:la\s+|el\s+)?(?:(?:opcion|opicon)\s*)?(\d+)\b/)
      : null);

  if (!hasOptionNumber) {
    return false;
  }

  const option = Number(hasOptionNumber[1]);
  return !Number.isInteger(option) || option < 1 || option > 7;
}

function looksLikeDateReference(text) {
  const monthNames = Object.keys(MONTH_INDEX).join("|");
  const weekdayNames = Object.keys(WEEKDAY_INDEX).join("|");

  return (
    new RegExp(`\\b(${monthNames}|${weekdayNames})\\b`).test(text) ||
    /\b(?:el|dia|para|para el|del)\s+[0-3]?\d\b/.test(text) ||
    /\b[0-3]?\d[/-][01]?\d\b/.test(text)
  );
}

function isServiceDetailRequest(text) {
  return (
    text.includes("de que va") ||
    text.includes("de que iba") ||
    text.includes("de que trata") ||
    text.includes("en que consiste") ||
    text.includes("hablame") ||
    text.includes("explica") ||
    text.includes("que incluye") ||
    text.includes("informacion")
  );
}

function isServiceNumberQuestion(text) {
  return (
    text.includes("opcion") ||
    text.includes("opicon") ||
    /\bde que\s+(?:va|iba|trata|trataba)\s+(?:(?:la\s+)?(?:opcion|opicon)\s+|la\s+|el\s+)?[1-7]\b/.test(text) ||
    /\ben que consiste\s+(?:(?:la\s+)?(?:opcion|opicon)\s+|la\s+|el\s+)?[1-7]\b/.test(text) ||
    /\b(?:hablame|explicame|explica)\b.*\b(?:opcion|opicon|servicio|numero|n)?\s*[1-7]\b/.test(text)
  );
}

function isServiceSelectionText(message) {
  const text = normalizeText(message);

  return Boolean(
    text.match(/^\s*[1-7](?:\s+por favor)?\s*$/) ||
      text.match(/\b(?:quiero|elijo|prefiero|mejor|ponme|reservame|cambio a|cambialo a|la|el)\s+(?:la\s+|el\s+)?(?:(?:opcion|opicon)\s*)?[1-7]\b/)
  );
}

function isServiceContext(history) {
  const recent = history
    .slice(-4)
    .map((message) => normalizeText(message.content || ""))
    .join(" ");

  return (
    recent.includes("servicio") ||
    recent.includes("opcion") ||
    recent.includes("corte") ||
    recent.includes("tinte") ||
    recent.includes("peinado") ||
    recent.includes("cual te interesa")
  );
}

function findLatestDate(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }

    const previousAssistant = findPreviousAssistant(messages, index);
    const isAskingForDateOrTime = isDateContext(previousAssistant) || isTimeContext(previousAssistant);
    const parsed = parseDateReference(message.content, {
      allowPureDay: isDateContext(previousAssistant),
      serviceContext: !isAskingForDateOrTime && isServiceContext(previousAssistant ? [previousAssistant] : []),
      referenceMonthDate: findRecentMonthDate(messages, index)
    });
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function findRecentMonthDate(messages, beforeIndex) {
  const monthNames = Object.keys(MONTH_INDEX).join("|");
  const monthRegex = new RegExp(`\\b[0-3]?\\d\\s+de\\s+(${monthNames})(?:\\s+de\\s+\\d{4})?\\b`);
  const numericDateRegex = /\b[0-3]?\d[/-][01]?\d(?:[/-]\d{2,4})?\b/;

  for (let index = beforeIndex - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }

    const text = normalizeText(message.content || "");
    if (!monthRegex.test(text) && !numericDateRegex.test(text)) {
      continue;
    }

    const parsed = parseDateReference(message.content);
    if (parsed) {
      return parsed.date;
    }
  }

  return null;
}

function findLatestTime(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }

    const previousAssistant = findPreviousAssistant(messages, index);
    const parsed = parseTimeReference(message.content, {
      allowPureTime: isTimeContext(previousAssistant)
    });
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function parseDateReference(message, options = {}) {
  const now = madridNow();
  const text = normalizeText(message);

  if (!text || isServiceNumberQuestion(text) || (options.serviceContext && isServiceSelectionText(text))) {
    return null;
  }

  if (text.includes("pasado manana")) {
    return { date: addDays(now, 2), source: "relative" };
  }

  if (text.includes("manana")) {
    return { date: addDays(now, 1), source: "relative" };
  }

  if (text.includes("hoy")) {
    return { date: now, source: "relative" };
  }

  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return buildDate(Number(isoMatch[3]), Number(isoMatch[2]) - 1, Number(isoMatch[1]), "iso");
  }

  const slashMatch = text.match(/\b([0-3]?\d)[/-]([01]?\d)(?:[/-](\d{2,4}))?\b/);
  if (slashMatch) {
    const year = slashMatch[3] ? normalizeYear(Number(slashMatch[3])) : now.getFullYear();
    return buildDate(Number(slashMatch[1]), Number(slashMatch[2]) - 1, year, "numeric");
  }

  const monthNames = Object.keys(MONTH_INDEX).join("|");
  const monthMatch = text.match(new RegExp(`\\b([0-3]?\\d)\\s+de\\s+(${monthNames})(?:\\s+de\\s+(\\d{4}))?\\b`));
  if (monthMatch) {
    const year = monthMatch[3] ? Number(monthMatch[3]) : now.getFullYear();
    return buildDate(Number(monthMatch[1]), MONTH_INDEX[monthMatch[2]], year, "monthName");
  }

  const weekdayNames = Object.keys(WEEKDAY_INDEX).join("|");
  const weekdayDayMatch =
    text.match(new RegExp(`\\b(${weekdayNames})\\s+([0-3]?\\d)\\b`)) ||
    text.match(new RegExp(`\\b([0-3]?\\d)\\s+(?:de\\s+)?(${weekdayNames})\\b`));
  if (weekdayDayMatch) {
    const weekday = Number.isNaN(Number(weekdayDayMatch[1])) ? weekdayDayMatch[1] : weekdayDayMatch[2];
    const day = Number.isNaN(Number(weekdayDayMatch[1])) ? Number(weekdayDayMatch[2]) : Number(weekdayDayMatch[1]);
    const referencedDate = buildDateInReferenceMonth(day, options.referenceMonthDate, "weekdayDay");
    if (referencedDate?.date.getDay() === WEEKDAY_INDEX[weekday]) {
      return referencedDate;
    }
    return buildWeekdayDayDate(day, WEEKDAY_INDEX[weekday], now);
  }

  for (const [weekday, weekdayIndex] of Object.entries(WEEKDAY_INDEX)) {
    if (text.includes(weekday)) {
      let daysAhead = (weekdayIndex - now.getDay() + 7) % 7;
      if (daysAhead === 0 && !text.includes("hoy")) {
        daysAhead = 7;
      }
      return { date: addDays(now, daysAhead), source: "weekday" };
    }
  }

  const dayMatch = text.match(/\b(?:el|dia|para el|para|del)\s+([0-3]?\d)\b/);
  if (dayMatch) {
    const referencedDate = buildDateInReferenceMonth(Number(dayMatch[1]), options.referenceMonthDate, "dayOfMonth");
    if (referencedDate) {
      return referencedDate;
    }
    return buildCurrentOrNextMonthDate(Number(dayMatch[1]), now);
  }

  const pureDayMatch = text.match(/^([0-3]?\d)$/);
  if (options.allowPureDay && pureDayMatch) {
    const referencedDate = buildDateInReferenceMonth(Number(pureDayMatch[1]), options.referenceMonthDate, "dayOfMonth");
    if (referencedDate) {
      return referencedDate;
    }
    return buildCurrentOrNextMonthDate(Number(pureDayMatch[1]), now);
  }

  return null;
}

function parseTimeReference(message, options = {}) {
  const rawText = String(message || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  const text = normalizeText(message);
  const prefixedMatch = rawText.match(/\b(?:a\s+las|las|hora|sobre\s+las|a\s+eso\s+de\s+las)\s+([0-2]?\d)(?:[:.h]\s*([0-5]\d))?\b/);
  const clockMatch = rawText.match(/\b([0-2]?\d)(?:[:.h]\s*([0-5]\d))\b/);
  const spokenMinuteMatch = rawText.match(/\b(?:a\s+las|las|hora|sobre\s+las|a\s+eso\s+de\s+las)\s+([0-2]?\d)\s+y\s+(?:(\d{1,2})|cuarto|media)\b/);
  const pureMatch = options.allowPureTime ? text.match(/^([0-2]?\d)$/) : null;
  const match = spokenMinuteMatch || prefixedMatch || clockMatch || pureMatch;

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = parseMinuteValue(match[2], match[0]);

  if (minutes === null) {
    return null;
  }

  if ((text.includes("tarde") || text.includes("noche")) && hours < 12) {
    hours += 12;
  } else if (!text.includes("manana") && hours >= 1 && hours <= 7) {
    hours += 12;
  }

  if (hours > 23) {
    return null;
  }

  return {
    value: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    hours,
    minutes
  };
}

function parseMinuteValue(rawMinutes, matchedText) {
  if (rawMinutes) {
    const minutes = Number(rawMinutes);
    return minutes >= 0 && minutes <= 59 ? minutes : null;
  }

  if (matchedText.includes("cuarto")) {
    return 15;
  }

  if (matchedText.includes("media")) {
    return 30;
  }

  return 0;
}

function isDateContext(message) {
  const text = normalizeText(message?.content || "");
  return (
    text.includes("que dia") ||
    text.includes("que fecha") ||
    text.includes("dia te viene bien") ||
    text.includes("dia te gustaria") ||
    text.includes("dia te interesa") ||
    text.includes("fecha futura") ||
    text.includes("viernes") ||
    text.includes("lunes")
  );
}

function isTimeContext(message) {
  const text = normalizeText(message?.content || "");
  return (
    text.includes("a que hora") ||
    text.includes("que hora") ||
    text.includes("hora te viene bien") ||
    text.includes("dime otra hora") ||
    text.includes("otra hora") ||
    text.includes("horario")
  );
}

function buildCurrentOrNextMonthDate(day, now) {
  let month = now.getMonth();
  let year = now.getFullYear();
  let date = buildDate(day, month, year, "dayOfMonth");

  if (!date) {
    return null;
  }

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  if (date.date < todayStart) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    date = buildDate(day, month, year, "dayOfMonth");
  }

  return date;
}

function buildWeekdayDayDate(day, weekdayIndex, now) {
  const currentMonthDate = buildDate(day, now.getMonth(), now.getFullYear(), "weekdayDay");
  if (currentMonthDate?.date.getDay() === weekdayIndex) {
    return currentMonthDate;
  }

  let nextMonth = now.getMonth() + 1;
  let year = now.getFullYear();
  if (nextMonth > 11) {
    nextMonth = 0;
    year += 1;
  }

  const nextMonthDate = buildDate(day, nextMonth, year, "weekdayDay");
  if (nextMonthDate?.date.getDay() === weekdayIndex) {
    return nextMonthDate;
  }

  return buildCurrentOrNextMonthDate(day, now);
}

function buildDateInReferenceMonth(day, referenceDate, source) {
  if (!referenceDate) {
    return null;
  }

  return buildDate(day, referenceDate.getMonth(), referenceDate.getFullYear(), source);
}

function buildDate(day, month, year, source) {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }

  const maxDay = new Date(year, month + 1, 0).getDate();
  if (month < 0 || month > 11 || day < 1 || day > maxDay) {
    return null;
  }

  return { date: new Date(year, month, day, 12, 0, 0), source };
}

function isPastDate(date, now = madridNow()) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);

  return dateStart < todayStart;
}

function isPastDateTime(date, time, now = madridNow()) {
  const dateInput = toDateInput(date);
  if (dateInput !== toDateInput(now)) {
    return false;
  }

  const appointmentTime = new Date(`${dateInput}T${time.value}:00`);
  return appointmentTime.getTime() <= now.getTime();
}

function normalizeYear(year) {
  return year < 100 ? 2000 + year : year;
}

function findPreviousAssistant(messages, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (messages[cursor].role === "assistant") {
      return messages[cursor];
    }
  }

  return null;
}

function describeService(service) {
  const descriptions = {
    Corte: "La opción de Corte incluye asesoramiento básico, corte adaptado a tu estilo y acabado final. Cuesta 20 euros y dura unos 30 minutos.",
    Tinte: "La opción de Tinte incluye coloración o mechas con productos profesionales. Cuesta 40 euros y dura unos 60 minutos.",
    Peinado: "La opción de Peinado incluye peinado o recogido para diario o evento. Cuesta 15 euros y dura unos 20 minutos.",
    "Corte y Peinado": "La opción 4 es Corte y Peinado: primero hacemos el corte y después el acabado/peinado para salir listo. Cuesta 35 euros y dura unos 50 minutos.",
    "Tinte y Peinado": "La opción 5 es Tinte y Peinado: coloración o mechas y acabado final. Cuesta 55 euros y dura unos 80 minutos.",
    "Corte y Tinte": "La opción 6 es Corte y Tinte: corte adaptado a tu estilo más coloración profesional. Cuesta 60 euros y dura unos 90 minutos.",
    "Corte y Tinte y Peinado": "La opción 7 es el pack completo: corte, tinte y peinado. Cuesta 75 euros y dura unos 110 minutos."
  };

  return descriptions[service.label] || `${service.label}: ${service.price} euros, ${service.duration} minutos.`;
}

function buildWeekendResponse(date, resetActiveAppointment = false) {
  let friday = new Date(date);
  while (friday.getDay() !== 5) {
    friday = addDays(friday, -1);
  }

  let monday = new Date(date);
  while (monday.getDay() !== 1) {
    monday = addDays(monday, 1);
  }

  return {
    handled: true,
    reply: `Lo siento, el ${formatShortSpanishDate(date)} estamos cerrados por descanso. ¿Te vendría bien el ${formatShortSpanishDate(friday)} o el ${formatShortSpanishDate(monday)}?`,
    saved: false,
    appointment: null,
    resetActiveAppointment
  };
}

function buildPastDateResponse(date, resetActiveAppointment = false) {
  return {
    handled: true,
    reply: `El ${formatShortSpanishDate(date)} ya ha pasado. Hoy es ${formatShortSpanishDate(madridNow())}. Dime una fecha futura de lunes a viernes.`,
    saved: false,
    appointment: null,
    resetActiveAppointment
  };
}

function buildPastDateTimeResponse(resetActiveAppointment = false) {
  return {
    handled: true,
    reply: `Esa hora ya ha pasado hoy. Ahora son las ${formatMadridTime(madridNow())}. Dime otra hora futura dentro del horario de 10:00 a 20:00.`,
    saved: false,
    appointment: null,
    resetActiveAppointment
  };
}

function buildSummaryResponse(context, resetActiveAppointment = false) {
  const missing = [];
  if (!context.customerName) {
    missing.push("nombre");
  }
  if (!context.service) {
    missing.push("servicio");
  }
  if (!context.date) {
    missing.push("día");
  }
  if (!context.time) {
    missing.push("hora");
  }

  if (missing.length > 0) {
    return {
      handled: true,
      reply: `Todavía me falta ${formatMissingItems(missing)} para darte el resumen completo.`,
      saved: false,
      appointment: null,
      resetActiveAppointment
    };
  }

  return {
    handled: true,
    reply: [
      "Aquí tienes el resumen actualizado:",
      `Nombre: ${context.customerName}`,
      `Servicio: ${context.service.label}`,
      `Fecha: ${formatShortSpanishDate(context.date.date)}`,
      `Hora: ${context.time.value}`,
      `Precio: ${context.service.price} euros`
    ].join("\n"),
    saved: false,
    appointment: null,
    resetActiveAppointment
  };
}

function formatMissingItems(items) {
  if (items.length === 1) {
    return `el ${items[0]}`;
  }

  const last = items.at(-1);
  return `${items.slice(0, -1).join(", ")} y ${last}`;
}

function buildValidationReply(error) {
  if (error.code === "SLOT_UNAVAILABLE") {
    return `${error.message} Dime otra hora y te la miro encantado.`;
  }

  if (error.code === "WEEKEND_CLOSED") {
    return `${error.message} ¿Te vendría bien el viernes anterior o el lunes siguiente?`;
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

  return "Casi lo tengo, pero necesito que me confirmes nombre, servicio, día y hora para dejar la cita bien registrada.";
}
