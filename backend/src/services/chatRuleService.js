import {
  addDays,
  formatMadridTime,
  formatSpanishDate,
  formatShortSpanishDate,
  isWeekendDate,
  madridNow,
  parseSpanishTimeReference,
  toDateInput
} from "./calendarService.js";
import {
  formatNumberedServices,
  getServiceByOption,
  normalizeText,
  resolveService
} from "../config/serviceCatalog.js";

const BUSINESS_ADDRESS = "Calle Mayor 42, Santander";
const BUSINESS_PHONE = "+34 942 000 000";

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

export function getPreflightChatReply({ userMessage, history = [] }) {
  const now = madridNow();
  const dateReference = parseDateReference(userMessage, now, { allowPureDay: isBookingDateContext(history) });
  const timeReference = parseTimeReference(userMessage, { allowPureTime: isBookingTimeContext(history) });

  if (isPromptInjectionRequest(userMessage)) {
    return "Solo puedo ayudarte con Corte Perfecto: servicios, precios, horarios, ubicación y gestión de citas.";
  }

  if (isCancellationHelpRequest(userMessage)) {
    return 'Para cancelar la cita activa, escribe "cancelar mi cita". Te pediré una nueva fecha si después quieres reservar otra.';
  }

  if (isNegatedCancellation(userMessage)) {
    return "Entendido, no cancelo nada. Tu cita activa se mantiene sin cambios.";
  }

  if (dateReference?.date && isPastDate(dateReference.date, now)) {
    return buildPastDateReply(dateReference.date, now);
  }

  if (dateReference?.date && isWeekendDate(dateReference.date)) {
    return buildWeekendClosedReply(dateReference.date);
  }

  if (dateReference?.date && timeReference && toDateInput(dateReference.date) === toDateInput(now)) {
    const requestedMinutes = timeReference.hours * 60 + timeReference.minutes;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (requestedMinutes <= currentMinutes) {
      return `Esa hora ya ha pasado hoy. Ahora son las ${formatMadridTime(now)}. Dime otra hora futura dentro del horario de 10:00 a 20:00.`;
    }
  }

  if (dateReference?.date && !timeReference && isBookingDateContext(history)) {
    return `Perfecto, para el ${formatShortSpanishDate(dateReference.date)}. ¿A que hora te viene bien? Abrimos de lunes a viernes de 10:00 a 20:00.`;
  }

  if (isInvalidNumericServiceSelection(userMessage, history)) {
    return `Esa opcion no existe. Elige un numero del 1 al 7:\n${formatNumberedServices()}`;
  }

  const serviceInformation = buildSpecificServiceReply(userMessage);
  if (serviceInformation) {
    return serviceInformation;
  }

  if (isLocationRequest(userMessage)) {
    return `Estamos en ${BUSINESS_ADDRESS}.`;
  }

  if (isContactRequest(userMessage)) {
    return `Puedes llamarnos al ${BUSINESS_PHONE}. Nuestro horario es de lunes a viernes de 10:00 a 20:00.`;
  }

  if (isTodayRequest(userMessage)) {
    return `Hoy es ${formatSpanishDate(now)} y ahora son las ${formatMadridTime(now)} en Santander.`;
  }

  if (isScheduleInfoRequest(userMessage)) {
    return "Nuestro horario es de lunes a viernes de 10:00 a 20:00. Sabados y domingos cerramos por descanso.";
  }

  if (isServiceInfoRequest(userMessage)) {
    return buildInformationReply();
  }

  if (isGreeting(userMessage)) {
    return "¡Hola! Puedo ayudarte con servicios, precios y horarios, o reservar, modificar y cancelar una cita.";
  }

  if (isHelpRequest(userMessage)) {
    return buildCapabilitiesReply();
  }

  return null;
}

export function buildSafeFallbackReply({ userMessage = "" } = {}) {
  const text = normalizeText(userMessage);

  if (text) {
    return [
      "No he podido interpretar esa pregunta con suficiente seguridad.",
      "Puedo ayudarte con servicios, precios, horarios, ubicación o una cita.",
      'Por ejemplo: "quiero reservar", "qué servicios tenéis" o "cuál es vuestro horario".'
    ].join("\n");
  }

  return buildCapabilitiesReply();
}

export function enrichNumericServiceSelection(userMessage, history = []) {
  const normalized = normalizeText(userMessage);
  const match = normalized.match(/^(?:opcion\s*)?([1-7])$/);

  if (!match) {
    return userMessage;
  }

  const recentContext = history
    .slice(-6)
    .map((message) => normalizeText(message.content || ""))
    .join(" ");

  const looksLikeServiceSelection = [
    "servicio",
    "servicios",
    "opcion",
    "opciones",
    "precio",
    "precios",
    "tarifa",
    "tarifas",
    "reserva",
    "cita",
    "corte",
    "tinte",
    "peinado"
  ].some((keyword) => recentContext.includes(keyword));

  if (!looksLikeServiceSelection) {
    return userMessage;
  }

  const service = getServiceByOption(match[1]);
  return service ? `Elijo la opcion ${service.option}: ${service.label}.` : userMessage;
}

function isServiceInfoRequest(message) {
  const text = normalizeText(message);

  return [
    "servicios",
    "servicio",
    "tarifas",
    "precios",
    "precio",
    "cuanto vale",
    "cuanto cuesta",
    "cuanto dura",
    "duracion",
    "catalogo",
    "que teneis",
    "que haceis",
    "opciones",
    "mas informacion",
    "más informacion",
    "informacion"
  ].some((keyword) => text.includes(keyword));
}

function isScheduleInfoRequest(message) {
  const text = normalizeText(message);

  return [
    "horario",
    "hora abris",
    "cuando abris",
    "abris manana",
    "abris hoy",
    "abre manana",
    "abre hoy",
    "dias abris",
    "apertura",
    "esta abierto",
    "abierto"
  ].some((keyword) => text.includes(keyword));
}

function buildSpecificServiceReply(message) {
  const text = normalizeText(message);
  const service = resolveService(message);

  if (
    !service ||
    !/\b(?:precio|cuesta|vale|coste|dura|duracion|tarda|incluye|consiste|informacion|detalle)\b/.test(text)
  ) {
    return null;
  }

  return `${service.label}: ${service.price} euros y ${service.duration} minutos aproximadamente.`;
}

function isLocationRequest(message) {
  const text = normalizeText(message);
  return /\b(?:donde estais|donde queda|ubicacion|direccion|como llego|en que calle)\b/.test(text);
}

function isContactRequest(message) {
  const text = normalizeText(message);
  return /\b(?:telefono|llamar|contacto|numero de telefono)\b/.test(text);
}

function isTodayRequest(message) {
  const text = normalizeText(message);
  return /\b(?:que dia es hoy|fecha de hoy|a cuanto estamos|que hora es)\b/.test(text);
}

function isGreeting(message) {
  const text = normalizeText(message);
  return /^(?:hola|ola|buenas|buenos dias|buenas tardes|buenas noches|hey)(?:\s+que tal)?[!.?]*$/.test(text);
}

function isHelpRequest(message) {
  const text = normalizeText(message);
  return /\b(?:que puedes hacer|en que me ayudas|ayuda|como funciona|opciones del chat)\b/.test(text);
}

function isCancellationHelpRequest(message) {
  const text = normalizeText(message);
  return (
    /\b(?:como|donde|cuando)\s+(?:puedo\s+)?(?:cancelar|anular|borrar|eliminar)\b/.test(text) ||
    /\b(?:puedo|se puede)\s+(?:cancelar|anular|borrar|eliminar)\b/.test(text)
  );
}

function isNegatedCancellation(message) {
  const text = normalizeText(message);
  return /\b(?:no|nunca)\s+(?:quiero\s+)?(?:cancelar|anular|borrar|eliminar)\b/.test(text);
}

function isPromptInjectionRequest(message) {
  const text = normalizeText(message);
  return (
    /\b(?:ignora|olvida|saltate)\b.*\b(?:instrucciones|reglas|prompt)\b/.test(text) ||
    /\b(?:system prompt|prompt del sistema|instrucciones internas|revela tu prompt)\b/.test(text)
  );
}

function isBookingDateContext(history) {
  const recentContext = history
    .slice(-8)
    .map((item) => normalizeText(item.content || ""))
    .join(" ");

  return [
    "que dia",
    "que fecha",
    "dia te gustaria",
    "dia te interesa",
    "viernes",
    "lunes",
    "reserva",
    "cita",
    "te apunto"
  ].some((keyword) => recentContext.includes(keyword));
}

function isBookingTimeContext(history) {
  const recentContext = history
    .slice(-8)
    .map((item) => normalizeText(item.content || ""))
    .join(" ");

  return [
    "a que hora",
    "que hora",
    "hora te viene bien",
    "dime otra hora",
    "otra hora",
    "horario"
  ].some((keyword) => recentContext.includes(keyword));
}

function isInvalidNumericServiceSelection(message, history) {
  const normalized = normalizeText(message);
  const match = normalized.match(/^(?:opcion\s*)?(\d+)$/);

  if (!match) {
    return false;
  }

  const option = Number(match[1]);
  if (option >= 1 && option <= 7) {
    return false;
  }

  const recentContext = history
    .slice(-6)
    .map((item) => normalizeText(item.content || ""))
    .join(" ");

  const looksLikeDateAnswer =
    recentContext.includes("que dia") ||
    recentContext.includes("que fecha") ||
    recentContext.includes("dia te gustaria") ||
    recentContext.includes("dia te interesa");

  if (looksLikeDateAnswer) {
    return false;
  }

  return (
    recentContext.includes("servicio") ||
    recentContext.includes("opcion") ||
    recentContext.includes("precio") ||
    recentContext.includes("cual te interesa") ||
    recentContext.includes("corte") ||
    recentContext.includes("tinte") ||
    recentContext.includes("peinado")
  );
}

function buildInformationReply() {
  return [
    "Nuestro horario es de lunes a viernes de 10:00 a 20:00. Sabados y domingos cerramos por descanso.",
    "",
    "Estas son las opciones de servicio. Puedes responder solo con el numero:",
    formatNumberedServices()
  ].join("\n");
}

function buildCapabilitiesReply() {
  return [
    "Puedo mostrarte los servicios, precios, duración y horario de Corte Perfecto.",
    "También puedo registrar una cita, cambiar sus datos o cancelar la cita activa."
  ].join("\n");
}

function parseDateReference(message, now, options = {}) {
  const text = normalizeText(message);
  const structuredText = normalizeStructuredText(message);

  if (!text || isServiceNumberQuestion(text)) {
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

  const isoMatch = structuredText.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return buildDate(Number(isoMatch[3]), Number(isoMatch[2]) - 1, Number(isoMatch[1]), "iso");
  }

  const slashMatch = structuredText.match(/\b([0-3]?\d)[/-]([01]?\d)(?:[/-](\d{2,4}))?\b/);
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

  const dayMatch = text.match(/\b(?:el|dia|para el|para)\s+([0-3]?\d)\b/);
  if (dayMatch) {
    return buildCurrentOrNextMonthDate(Number(dayMatch[1]), now);
  }

  const pureDayMatch = text.match(/^([0-3]?\d)$/);
  if (options.allowPureDay && pureDayMatch) {
    const day = Number(pureDayMatch[1]);
    if (day >= 1 && day <= 31) {
      return buildCurrentOrNextMonthDate(day, now);
    }
  }

  return null;
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

function parseTimeReference(message, options = {}) {
  return parseSpanishTimeReference(message, options);
}

function normalizeStructuredText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
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

function isPastDate(date, now) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);

  return dateStart < todayStart;
}

function normalizeYear(year) {
  return year < 100 ? 2000 + year : year;
}

function buildPastDateReply(date, now) {
  return `El ${formatShortSpanishDate(date)} ya ha pasado. Hoy es ${formatShortSpanishDate(now)}. Dime una fecha futura de lunes a viernes.`;
}

function buildWeekendClosedReply(date) {
  let friday = new Date(date);
  while (friday.getDay() !== 5) {
    friday = addDays(friday, -1);
  }

  let monday = new Date(date);
  while (monday.getDay() !== 1) {
    monday = addDays(monday, 1);
  }

  return `Lo siento, el ${formatShortSpanishDate(date)} estamos cerrados por descanso. ¿Te vendria bien el ${formatShortSpanishDate(friday)} o el ${formatShortSpanishDate(monday)}?`;
}
