const WEEKDAYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const WEEKDAYS_ACCENTED = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];
const HOUR_WORDS = {
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20
};

export function madridNow() {
  const madridString = new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" });
  return new Date(madridString);
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatSpanishDate(date) {
  const weekday = WEEKDAYS_ACCENTED[date.getDay()];
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday} ${day} de ${month} de ${year}`;
}

export function formatShortSpanishDate(date) {
  const weekday = WEEKDAYS_ACCENTED[date.getDay()];
  return `${weekday} ${date.getDate()}`;
}

export function formatMadridTime(date = madridNow()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function isWeekendDate(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isWeekendDateString(dateString) {
  return isWeekendDate(new Date(`${dateString}T12:00:00`));
}

export function parseSpanishTimeReference(message, options = {}) {
  const text = normalizeCalendarText(message);
  const prefix = "(?:a\\s+las|las|hora|sobre\\s+las|a\\s+eso\\s+de\\s+las)";
  const wordPattern = Object.keys(HOUR_WORDS).join("|");
  const spokenMinuteMatch = text.match(
    new RegExp(`\\b${prefix}\\s+([0-2]?\\d)\\s+y\\s+(?:(\\d{1,2})|cuarto|media)\\b`)
  );
  const numericMatch =
    spokenMinuteMatch ||
    text.match(new RegExp(`\\b${prefix}\\s+([0-2]?\\d)(?:[:.h]\\s*([0-5]\\d))?\\b`)) ||
    text.match(/\b([0-2]?\d)(?:[:.h]\s*([0-5]\d))\b/) ||
    (options.allowPureTime ? text.match(/^([0-2]?\d)$/) : null);
  const wordMatch =
    text.match(new RegExp(`\\b${prefix}\\s+(${wordPattern})(?:\\s+y\\s+(?:(\\d{1,2})|cuarto|media))?\\b`)) ||
    (options.allowPureTime
      ? text.match(new RegExp(`^(${wordPattern})(?:\\s+y\\s+(?:(\\d{1,2})|cuarto|media))?$`))
      : null);
  const lessQuarterMatch = text.match(
    new RegExp(`\\b${prefix}\\s+([0-2]?\\d|${wordPattern})\\s+menos\\s+cuarto\\b`)
  );

  if (text.includes("mediodia")) {
    return buildTimeResult(12, 0);
  }

  if (text.includes("medianoche")) {
    return buildTimeResult(0, 0);
  }

  const match = lessQuarterMatch || numericMatch || wordMatch;
  if (!match) {
    return null;
  }

  const rawHour = match[1];
  let hours = HOUR_WORDS[rawHour] ?? Number(rawHour);
  let minutes = lessQuarterMatch ? 45 : parseMinuteValue(match[2], match[0]);

  if (!Number.isInteger(hours) || minutes === null) {
    return null;
  }

  if ((text.includes("tarde") || text.includes("noche")) && hours < 12) {
    hours += 12;
  } else if (!text.includes("manana") && hours >= 1 && hours <= 7) {
    hours += 12;
  }

  if (lessQuarterMatch) {
    hours -= 1;
    if (hours < 0) {
      hours = 23;
    }
  }

  return buildTimeResult(hours, minutes);
}

export function getWeekdayName(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return WEEKDAYS[date.getDay()];
}

export function getPromptCalendar() {
  const today = madridNow();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const workingDays = [];
  let cursor = new Date(today);

  while (workingDays.length < 7) {
    if (!isWeekendDate(cursor)) {
      workingDays.push(`${formatSpanishDate(cursor)} (${toDateInput(cursor)})`);
    }
    cursor = addDays(cursor, 1);
  }

  return {
    today: `${formatSpanishDate(today)} (${toDateInput(today)})`,
    tomorrow: `${formatSpanishDate(tomorrow)} (${toDateInput(tomorrow)})`,
    dayAfter: `${formatSpanishDate(dayAfter)} (${toDateInput(dayAfter)})`,
    currentTime: formatMadridTime(today),
    nextWorkingDays: workingDays.join(", ")
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

function buildTimeResult(hours, minutes) {
  if (!Number.isInteger(hours) || hours < 0 || hours > 23 || !Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  return {
    value: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    hours,
    minutes
  };
}

function normalizeCalendarText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
