import test from "node:test";
import assert from "node:assert/strict";
import { handleBookingFlow } from "../src/services/bookingFlowService.js";

test("bookingFlowService pide nombre real antes de reservar", async () => {
  const result = await handleBookingFlow({
    userMessage: "quiero reservar una cita",
    history: [],
    conversationId: "test-flow-name"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /nombre/i);
});

test("bookingFlowService acepta servicios por numero dentro del contexto", async () => {
  const result = await handleBookingFlow({
    userMessage: "4",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Laura" },
      { role: "assistant", content: "¿Qué servicio quieres? Puedes responder solo con el numero:\n1. Corte\n4. Corte y Peinado" }
    ],
    conversationId: "test-flow-service"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /Corte y Peinado/);
  assert.match(result.reply, /dia|día/i);
});

test("bookingFlowService bloquea fines de semana antes de pedir hora", async () => {
  const result = await handleBookingFlow({
    userMessage: "el 20 de junio de 2099",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Laura" },
      { role: "assistant", content: "¿Qué servicio quieres?" },
      { role: "user", content: "6" }
    ],
    conversationId: "test-flow-weekend"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /cerrados|descanso/i);
  assert.match(result.reply, /viernes|lunes/i);
  assert.doesNotMatch(result.reply, /hora/i);
});
