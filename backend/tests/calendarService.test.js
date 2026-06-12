import test from "node:test";
import assert from "node:assert/strict";
import {
  formatShortSpanishDate,
  getWeekdayName,
  isWeekendDateString,
  parseSpanishTimeReference,
  toDateInput
} from "../src/services/calendarService.js";

test("calendarService identifica fines de semana y dias laborables", () => {
  assert.equal(isWeekendDateString("2099-06-20"), true);
  assert.equal(isWeekendDateString("2099-06-21"), true);
  assert.equal(isWeekendDateString("2099-06-22"), false);
});

test("calendarService formatea fechas de forma estable para el chat", () => {
  const monday = new Date("2099-06-22T12:00:00");

  assert.equal(toDateInput(monday), "2099-06-22");
  assert.equal(getWeekdayName("2099-06-22"), "lunes");
  assert.equal(formatShortSpanishDate(monday), "lunes 22");
});

test("calendarService interpreta horas naturales en español", () => {
  assert.equal(parseSpanishTimeReference("a las seis y media de la tarde").value, "18:30");
  assert.equal(parseSpanishTimeReference("a las diez menos cuarto").value, "09:45");
  assert.equal(parseSpanishTimeReference("mediodía").value, "12:00");
  assert.equal(parseSpanishTimeReference("ocho", { allowPureTime: true }).value, "08:00");
  assert.equal(parseSpanishTimeReference("a las 25:90"), null);
});
