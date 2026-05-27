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
