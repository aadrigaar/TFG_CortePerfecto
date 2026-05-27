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
  const serviceDetail = getServiceDetailReply(userMessage, history);
  if (serviceDetail) {
    return serviceDetail;
  }

  const messages = [...history, { role: "user", content: userMessage }];
  const context = buildBookingContext(messages);

  if (!context.isBookingFlow) {
    return null;
  }

  if (context.service && context.date && isWeekendDate(context.date.date)) {
    return buildWeekendResponse(context.date.date);
  }

  if (!context.customerName) {
    return {
      handled: true,
      reply: "¡Claro! ¿A nombre de quién pongo la reserva?",
      saved: false,
      appointment: null
    };
  }

  if (!context.service) {
    return {
      handled: true,
      reply: `Perfecto, ${context.customerName}. ¿Qué servicio quieres? Puedes responder solo con el numero:\n${formatNumberedServices()}`,
      saved: false,
      appointment: null
    };
  }

  if (!context.date) {
    return {
      handled: true,
      reply: `Genial, ${context.customerName}. Has elegido ${context.service.label}. ¿Qué día te viene bien?`,
      saved: false,
      appointment: null
    };
  }

  if (isWeekendDate(context.date.date)) {
    return buildWeekendResponse(context.date.date);
  }

  if (!context.time) {
    return {
      handled: true,
      reply: `Perfecto, para el ${formatShortSpanishDate(context.date.date)}. ¿A qué hora te viene bien? Abrimos de lunes a viernes de 10:00 a 20:00.`,
      saved: false,
      appointment: null
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
    const appointment = activeAppointmentId
      ? await updateAppointment(activeAppointmentId, { ...payload, source: "chat" })
      : await createAppointment(payload, "chat");

    return {
      handled: true,
      reply: `¡Perfecto, ${appointment.customerName}! Te apunto el ${formatShortSpanishDate(new Date(`${appointment.date}T12:00:00`))} a las ${appointment.time} para ${appointment.service}. ¡Hasta entonces!`,
      saved: true,
      appointment
    };
  } catch (error) {
    return {
      handled: true,
      reply: buildValidationReply(error),
      saved: false,
      appointment: null
    };
  }
}

function getServiceDetailReply(userMessage, history) {
  const service = parseServiceReference(userMessage, history);
  const text = normalizeText(userMessage);

  const isAskingDetail =
    service &&
    (text.includes("de que va") ||
      text.includes("hablame") ||
      text.includes("explica") ||
      text.includes("que incluye") ||
      text.includes("informacion"));

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

function buildBookingContext(messages) {
  const userMessages = messages.filter((message) => message.role === "user");
  const lastUserMessage = userMessages.at(-1)?.content || "";
  const lastText = normalizeText(lastUserMessage);

  const customerName = findCustomerName(messages);
  const service = findLatestService(messages);
  const date = findLatestDate(userMessages);
  const time = findLatestTime(userMessages);
  const isBookingFlow =
    hasBookingIntent(lastText) ||
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
  return ["cita", "reserv", "apuntame", "turno", "hueco", "agendar"].some((keyword) => text.includes(keyword));
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
    text.match(/\b(?:opcion|servicio|numero|nº|n)\s*([1-7])\b/) ||
    text.match(/\bde que va el\s+([1-7])\b/) ||
    text.match(/\bhablame\s+(?:sobre|del|de la)?\s*(?:opcion\s*)?([1-7])\b/) ||
    (isServiceContext(history) ? text.match(/^\s*([1-7])\s*$/) : null) ||
    (isServiceContext(history) ? text.match(/\bel\s+([1-7])\b/) : null);

  if (optionMatch) {
    return getServiceByOption(optionMatch[1]);
  }

  return resolveService(message);
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

function findLatestDate(userMessages) {
  for (let index = userMessages.length - 1; index >= 0; index -= 1) {
    const parsed = parseDateReference(userMessages[index].content);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function findLatestTime(userMessages) {
  for (let index = userMessages.length - 1; index >= 0; index -= 1) {
    const parsed = parseTimeReference(userMessages[index].content);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function parseDateReference(message) {
  const now = madridNow();
  const text = normalizeText(message);

  if (!text || text.includes("opcion")) {
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
    return buildCurrentOrNextMonthDate(Number(dayMatch[1]), now);
  }

  return null;
}

function parseTimeReference(message) {
  const text = normalizeText(message);
  const match = text.match(/\b(?:a las|las|hora)\s+([0-2]?\d)(?::([0-5]\d))?\b/);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;

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

function buildWeekendResponse(date) {
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
    appointment: null
  };
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
