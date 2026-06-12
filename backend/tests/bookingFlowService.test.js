import test from "node:test";
import assert from "node:assert/strict";
import { handleBookingFlow } from "../src/services/bookingFlowService.js";
import { getPreflightChatReply } from "../src/services/chatRuleService.js";

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

test("bookingFlowService rechaza fechas pasadas antes de pedir hora", async () => {
  const history = [
    { role: "user", content: "quiero reservar una cita" },
    { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
    { role: "user", content: "Laura" },
    { role: "assistant", content: "¿Qué servicio quieres?" },
    { role: "user", content: "6" }
  ];

  const result = await handleBookingFlow({
    userMessage: "el 29 de mayo de 2026",
    history,
    conversationId: "test-flow-past-date"
  });
  const preflightReply = getPreflightChatReply({ userMessage: "el 29 de mayo de 2026", history });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /ya ha pasado/i);
  assert.doesNotMatch(result.reply, /hora/i);
  assert.match(preflightReply, /ya ha pasado/i);
});

test("bookingFlowService distingue detalle de opcion y fecha en el historial", async () => {
  const result = await handleBookingFlow({
    userMessage: "y de que iba la opcion 4",
    history: [
      { role: "user", content: "dame informacion" },
      { role: "assistant", content: "Estas son las opciones de servicio. Puedes responder solo con el numero." },
      { role: "user", content: "de que va el 6" },
      {
        role: "assistant",
        content:
          "La opción 6 es Corte y Tinte: corte adaptado a tu estilo más coloración profesional. ¿Quieres reservar esta opción?"
      }
    ],
    conversationId: "test-flow-option-detail"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /opci[oó]n 4/i);
  assert.match(result.reply, /Corte y Peinado/i);
  assert.doesNotMatch(result.reply, /cerrados|descanso/i);
});

test("bookingFlowService explica otra opcion con seguimiento corto", async () => {
  const detailHistory = [
    { role: "user", content: "Quiero mas informacion" },
    { role: "assistant", content: "Estas son las opciones de servicio. Puedes responder solo con el numero." },
    { role: "user", content: "de que va la 4" },
    {
      role: "assistant",
      content:
        "La opción 4 es Corte y Peinado: primero hacemos el corte y después el acabado/peinado para salir listo. ¿Quieres reservar esta opción?"
    }
  ];

  const shortFollowUp = await handleBookingFlow({
    userMessage: "y la 3",
    history: detailHistory,
    conversationId: "test-flow-short-detail-follow-up"
  });

  const typoFollowUp = await handleBookingFlow({
    userMessage: "y la opicon 5?",
    history: [
      ...detailHistory,
      { role: "user", content: "y la 3" },
      { role: "assistant", content: shortFollowUp.reply }
    ],
    conversationId: "test-flow-typo-detail-follow-up"
  });

  assert.equal(shortFollowUp.handled, true);
  assert.equal(shortFollowUp.saved, false);
  assert.match(shortFollowUp.reply, /Peinado/);
  assert.doesNotMatch(shortFollowUp.reply, /nombre/i);
  assert.equal(typoFollowUp.handled, true);
  assert.match(typoFollowUp.reply, /opci[oó]n 5|Tinte y Peinado/i);
  assert.doesNotMatch(typoFollowUp.reply, /nombre/i);
});

test("bookingFlowService permite cambiar de opcion con lenguaje natural", async () => {
  const detailHistory = [
    { role: "user", content: "Quiero mas informacion" },
    { role: "assistant", content: "Estas son las opciones de servicio. Puedes responder solo con el numero." },
    { role: "user", content: "de que va la opcion4" },
    {
      role: "assistant",
      content:
        "La opción 4 es Corte y Peinado: primero hacemos el corte y después el acabado/peinado para salir listo. ¿Quieres reservar esta opción?"
    }
  ];

  const selectionResult = await handleBookingFlow({
    userMessage: "no mejor quiero la 3",
    history: detailHistory,
    conversationId: "test-flow-natural-service-change"
  });

  const nameResult = await handleBookingFlow({
    userMessage: "Pepe",
    history: [
      ...detailHistory,
      { role: "user", content: "no mejor quiero la 3" },
      { role: "assistant", content: selectionResult.reply }
    ],
    conversationId: "test-flow-natural-service-change"
  });

  assert.equal(selectionResult.handled, true);
  assert.match(selectionResult.reply, /nombre/i);
  assert.equal(nameResult.handled, true);
  assert.match(nameResult.reply, /Peinado/);
  assert.doesNotMatch(nameResult.reply, /Corte y Peinado/);
  assert.match(nameResult.reply, /dia|día/i);
});

test("bookingFlowService no confunde seleccion de servicio con fecha", async () => {
  const infoHistory = [
    { role: "user", content: "Quiero mas informacion" },
    {
      role: "assistant",
      content:
        "Estas son las opciones de servicio. Puedes responder solo con el numero:\n1. Corte\n2. Tinte\n3. Peinado\n4. Corte y Peinado\n5. Tinte y Peinado\n6. Corte y Tinte\n7. Corte y Tinte y Peinado"
    }
  ];

  const selectionResult = await handleBookingFlow({
    userMessage: "quiero el 7",
    history: infoHistory,
    conversationId: "test-flow-service-selection-not-date"
  });

  const nameResult = await handleBookingFlow({
    userMessage: "jose",
    history: [
      ...infoHistory,
      { role: "user", content: "quiero el 7" },
      { role: "assistant", content: selectionResult.reply }
    ],
    conversationId: "test-flow-service-selection-not-date"
  });

  const changeResult = await handleBookingFlow({
    userMessage: "6",
    history: [
      ...infoHistory,
      { role: "user", content: "quiero el 7" },
      { role: "assistant", content: selectionResult.reply },
      { role: "user", content: "jose" },
      { role: "assistant", content: "Perfecto, jose. ¿Qué servicio quieres? Puedes responder solo con el numero." }
    ],
    conversationId: "test-flow-service-selection-not-date"
  });

  assert.equal(selectionResult.handled, true);
  assert.match(selectionResult.reply, /nombre/i);
  assert.doesNotMatch(selectionResult.reply, /domingo 7|cerrados/i);
  assert.equal(nameResult.handled, true);
  assert.match(nameResult.reply, /Corte y Tinte y Peinado/);
  assert.match(nameResult.reply, /dia|día/i);
  assert.doesNotMatch(nameResult.reply, /domingo 7|cerrados/i);
  assert.equal(changeResult.handled, true);
  assert.match(changeResult.reply, /Corte y Tinte/);
  assert.match(changeResult.reply, /dia|día/i);
  assert.doesNotMatch(changeResult.reply, /sabado 6|cerrados/i);
});

test("bookingFlowService respeta una negativa despues de explicar un servicio", async () => {
  const result = await handleBookingFlow({
    userMessage: "no gracias",
    history: [
      { role: "user", content: "de que va la opcion 4" },
      {
        role: "assistant",
        content:
          "La opción 4 es Corte y Peinado: primero hacemos el corte y después el acabado/peinado para salir listo. ¿Quieres reservar esta opción?"
      }
    ],
    conversationId: "test-flow-decline"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /entendido/i);
  assert.doesNotMatch(result.reply, /nombre/i);
});

test("bookingFlowService avisa si el numero de servicio no existe", async () => {
  const result = await handleBookingFlow({
    userMessage: "8",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Laura" },
      { role: "assistant", content: "¿Qué servicio quieres? Puedes responder solo con el numero." }
    ],
    conversationId: "test-flow-invalid-service-option"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /no existe/i);
  assert.match(result.reply, /1\. Corte/i);
});

test("bookingFlowService entiende dia y hora cortos cuando acaba de pedirlos", async (context) => {
  context.mock.timers.enable({
    apis: ["Date"],
    now: new Date("2026-05-30T10:00:00+02:00")
  });

  const result = await handleBookingFlow({
    userMessage: "resumen",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Pepe" },
      { role: "assistant", content: "¿Qué servicio quieres? Puedes responder solo con el numero." },
      { role: "user", content: "3" },
      { role: "assistant", content: "Genial, Pepe. Has elegido Peinado. ¿Qué día te viene bien?" },
      { role: "user", content: "2" },
      { role: "assistant", content: "Perfecto, para el martes 2. ¿A qué hora te viene bien?" },
      { role: "user", content: "12:30" }
    ],
    conversationId: "test-flow-short-date-time"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /Resumen/i);
  assert.match(result.reply, /Peinado/i);
  assert.match(result.reply, /martes 2/i);
  assert.match(result.reply, /12:30/i);
});

test("bookingFlowService entiende minutos hablados en la hora", async () => {
  const result = await handleBookingFlow({
    userMessage: "resumen",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Jorge" },
      { role: "assistant", content: "¿Qué servicio quieres? Puedes responder solo con el numero." },
      { role: "user", content: "7" },
      { role: "assistant", content: "Genial, Jorge. Has elegido Corte y Tinte y Peinado. ¿Qué día te viene bien?" },
      { role: "user", content: "mañana" },
      { role: "assistant", content: "Perfecto, para el lunes 1. ¿A qué hora te viene bien?" },
      { role: "user", content: "a las 6 y 15" }
    ],
    conversationId: "test-flow-spoken-minutes"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /18:15/i);
  assert.doesNotMatch(result.reply, /18:00/i);
});

test("bookingFlowService interpreta dia con weekday sin desplazarlo si ya paso", async (context) => {
  context.mock.timers.enable({
    apis: ["Date"],
    now: new Date("2026-05-30T10:00:00+02:00")
  });

  const history = [
    { role: "user", content: "quiero reservar una cita" },
    { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
    { role: "user", content: "Laura" },
    { role: "assistant", content: "¿Qué servicio quieres?" },
    { role: "user", content: "6" },
    { role: "assistant", content: "¿Qué día te viene bien?" }
  ];

  const result = await handleBookingFlow({
    userMessage: "viernes 29",
    history,
    conversationId: "test-flow-weekday-day-past"
  });
  const preflightReply = getPreflightChatReply({ userMessage: "viernes 29", history });

  assert.equal(result.handled, true);
  assert.match(result.reply, /ya ha pasado/i);
  assert.match(preflightReply, /ya ha pasado/i);
});

test("bookingFlowService conserva el mes cuando se corrige solo el dia", async () => {
  const result = await handleBookingFlow({
    userMessage: "pues el 20",
    history: [
      { role: "user", content: "quiero otra cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "jose" },
      { role: "assistant", content: "¿Qué servicio quieres?" },
      { role: "user", content: "la 5" },
      { role: "assistant", content: "Genial, jose. Has elegido Tinte y Peinado. ¿Qué día te viene bien?" },
      { role: "user", content: "el 24 de octubre" },
      {
        role: "assistant",
        content: "Lo siento, el sabado 24 estamos cerrados por descanso. ¿Te vendría bien el viernes 23 o el lunes 26?"
      }
    ],
    conversationId: "test-flow-preserve-month"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /martes 20/i);
  assert.match(result.reply, /hora/i);
  assert.doesNotMatch(result.reply, /sabado 20|cerrados/i);
});

test("bookingFlowService empieza una reserva nueva sin reutilizar la cita activa anterior", async () => {
  const result = await handleBookingFlow({
    userMessage: "quiero otra cita",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Pepe" },
      { role: "assistant", content: "¿Qué servicio quieres?" },
      { role: "user", content: "3" },
      { role: "assistant", content: "Genial, Pepe. Has elegido Peinado. ¿Qué día te viene bien?" },
      { role: "user", content: "martes 2" },
      { role: "assistant", content: "¿A qué hora te viene bien?" },
      { role: "user", content: "12:00" },
      { role: "assistant", content: "¡Perfecto, Pepe! Te apunto el martes 2 a las 12:00 para Peinado. ¡Hasta entonces!" }
    ],
    conversationId: "test-flow-new-booking",
    activeAppointmentId: "507f1f77bcf86cd799439011"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.equal(result.resetActiveAppointment, true);
  assert.match(result.reply, /nombre/i);
  assert.doesNotMatch(result.reply, /Pepe/);
});

test("bookingFlowService no reutiliza datos antiguos cuando el usuario pide cambiar algo sin valor nuevo", async () => {
  const completedHistory = [
    { role: "user", content: "quiero reservar una cita" },
    { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
    { role: "user", content: "jose" },
    { role: "assistant", content: "¿Qué servicio quieres?" },
    { role: "user", content: "la 5" },
    { role: "assistant", content: "Genial, jose. Has elegido Tinte y Peinado. ¿Qué día te viene bien?" },
    { role: "user", content: "el 20 de octubre" },
    { role: "assistant", content: "Perfecto, para el martes 20. ¿A qué hora te viene bien?" },
    { role: "user", content: "a las 10" },
    { role: "assistant", content: "¡Perfecto, jose! Te apunto el martes 20 a las 10:00 para Tinte y Peinado. ¡Hasta entonces!" }
  ];

  const timeResult = await handleBookingFlow({
    userMessage: "quiero cambiar la hora",
    history: completedHistory,
    conversationId: "test-flow-change-missing-time",
    activeAppointmentId: "507f1f77bcf86cd799439011"
  });

  const serviceResult = await handleBookingFlow({
    userMessage: "quiero cambiar el servicio",
    history: completedHistory,
    conversationId: "test-flow-change-missing-service",
    activeAppointmentId: "507f1f77bcf86cd799439011"
  });

  const genericResult = await handleBookingFlow({
    userMessage: "quiero cambiar la cita",
    history: completedHistory,
    conversationId: "test-flow-change-generic",
    activeAppointmentId: "507f1f77bcf86cd799439011"
  });

  assert.equal(timeResult.handled, true);
  assert.equal(timeResult.saved, false);
  assert.match(timeResult.reply, /nueva hora/i);
  assert.doesNotMatch(timeResult.reply, /te apunto/i);
  assert.equal(serviceResult.handled, true);
  assert.equal(serviceResult.saved, false);
  assert.match(serviceResult.reply, /servicio quieres cambiar|servicio quieres/i);
  assert.match(serviceResult.reply, /1\. Corte/i);
  assert.equal(genericResult.handled, true);
  assert.equal(genericResult.saved, false);
  assert.match(genericResult.reply, /servicio, día, hora o nombre/i);
  assert.doesNotMatch(genericResult.reply, /te apunto/i);
});

test("bookingFlowService cancela un intento de reserva sin cita activa", async () => {
  const result = await handleBookingFlow({
    userMessage: "cancelar",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" }
    ],
    conversationId: "test-flow-cancel-without-active"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.equal(result.resetActiveAppointment, true);
  assert.match(result.reply, /reserva sin hacer/i);
});

test("bookingFlowService deja consultar horario despues de registrar una cita", async () => {
  const history = [
    { role: "user", content: "quiero reservar una cita" },
    { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
    { role: "user", content: "jose" },
    { role: "assistant", content: "¿Qué servicio quieres?" },
    { role: "user", content: "la 5" },
    { role: "assistant", content: "Genial, jose. Has elegido Tinte y Peinado. ¿Qué día te viene bien?" },
    { role: "user", content: "el 20 de octubre" },
    { role: "assistant", content: "Perfecto, para el martes 20. ¿A qué hora te viene bien?" },
    { role: "user", content: "a las 10" },
    { role: "assistant", content: "¡Perfecto, jose! Te apunto el martes 20 a las 10:00 para Tinte y Peinado. ¡Hasta entonces!" }
  ];

  const bookingResult = await handleBookingFlow({
    userMessage: "que horario teneis en la peluqueria",
    history,
    conversationId: "test-flow-schedule-after-booking"
  });
  const preflightReply = getPreflightChatReply({ userMessage: "que horario teneis en la peluqueria", history });

  assert.equal(bookingResult, null);
  assert.match(preflightReply, /lunes a viernes de 10:00 a 20:00/i);
  assert.doesNotMatch(preflightReply, /te apunto/i);
});

test("bookingFlowService deja pasar peticiones informativas aunque haya contexto de reserva", async () => {
  const history = [
    { role: "user", content: "dame informacion" },
    { role: "assistant", content: "Estas son las opciones de servicio. Puedes responder solo con el numero." },
    { role: "user", content: "de que va el 6" },
    {
      role: "assistant",
      content:
        "La opción 6 es Corte y Tinte: corte adaptado a tu estilo más coloración profesional. ¿Quieres reservar esta opción?"
    }
  ];

  const bookingResult = await handleBookingFlow({
    userMessage: "vuelve a darme las opciones",
    history,
    conversationId: "test-flow-info-interrupt"
  });
  const preflightReply = getPreflightChatReply({ userMessage: "vuelve a darme las opciones", history });
  const moreInfoResult = await handleBookingFlow({
    userMessage: "Quiero mas informacion",
    history,
    conversationId: "test-flow-more-info-interrupt"
  });
  const moreInfoReply = getPreflightChatReply({ userMessage: "Quiero mas informacion", history });

  assert.equal(bookingResult, null);
  assert.match(preflightReply, /Estas son las opciones de servicio/i);
  assert.match(preflightReply, /6\. Corte y Tinte/i);
  assert.equal(moreInfoResult, null);
  assert.match(moreInfoReply, /Estas son las opciones de servicio/i);
});

test("bookingFlowService separa nombre y servicio escritos en la misma frase", async () => {
  const result = await handleBookingFlow({
    userMessage: "me llamo Pepe y quiero un corte",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" }
    ],
    conversationId: "test-name-and-service"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /Pepe/);
  assert.match(result.reply, /Corte/);
  assert.doesNotMatch(result.reply, /Pepe y quiero/i);
});

test("bookingFlowService respeta negaciones y conserva el ultimo servicio elegido", async () => {
  const firstResult = await handleBookingFlow({
    userMessage: "no quiero corte, quiero tinte",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" }
    ],
    conversationId: "test-negated-service"
  });

  const secondResult = await handleBookingFlow({
    userMessage: "Laura",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "no quiero corte, quiero tinte" },
      { role: "assistant", content: firstResult.reply }
    ],
    conversationId: "test-negated-service"
  });

  assert.match(firstResult.reply, /nombre/i);
  assert.match(secondResult.reply, /Tinte/);
  assert.doesNotMatch(secondResult.reply, /Corte y Tinte/);
});

test("bookingFlowService no cancela ante una negacion o una pregunta informativa", async () => {
  const history = [
    { role: "user", content: "quiero reservar una cita" },
    { role: "assistant", content: "¿A nombre de quién pongo la reserva?" }
  ];

  const negatedResult = await handleBookingFlow({
    userMessage: "no quiero cancelar",
    history,
    conversationId: "test-no-cancel"
  });
  const questionResult = await handleBookingFlow({
    userMessage: "como puedo cancelar una cita",
    history,
    conversationId: "test-cancel-help"
  });

  assert.equal(negatedResult, null);
  assert.equal(questionResult, null);
  assert.match(getPreflightChatReply({ userMessage: "no quiero cancelar", history }), /no cancelo nada/i);
  assert.match(getPreflightChatReply({ userMessage: "como puedo cancelar una cita", history }), /escribe/i);
});

test("bookingFlowService rechaza nombres con datos adicionales", async () => {
  const result = await handleBookingFlow({
    userMessage: "Pepe y mi telefono es 666123123",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" }
    ],
    conversationId: "test-invalid-name-extra-data"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /nombre real/i);
});

test("bookingFlowService no reutiliza una fecha anterior si la nueva es imposible", async () => {
  const result = await handleBookingFlow({
    userMessage: "31/02/2027",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Laura" },
      { role: "assistant", content: "¿Qué servicio quieres?" },
      { role: "user", content: "2" },
      { role: "assistant", content: "¿Qué día te viene bien?" },
      { role: "user", content: "22/06/2027" },
      { role: "assistant", content: "Claro. ¿Qué nuevo día te viene bien?" }
    ],
    conversationId: "test-invalid-replacement-date"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /no existe|no reconozco/i);
  assert.doesNotMatch(result.reply, /hora te viene bien/i);
});

test("bookingFlowService no reutiliza una hora anterior si la nueva es invalida", async () => {
  const result = await handleBookingFlow({
    userMessage: "25:90",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Laura" },
      { role: "assistant", content: "¿Qué servicio quieres?" },
      { role: "user", content: "2" },
      { role: "assistant", content: "¿Qué día te viene bien?" },
      { role: "user", content: "22/06/2027" },
      { role: "assistant", content: "¿A qué hora te viene bien?" },
      { role: "user", content: "10:00" },
      { role: "assistant", content: "Claro. ¿A qué nueva hora te viene bien?" }
    ],
    conversationId: "test-invalid-replacement-time"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /no reconozco esa hora/i);
  assert.doesNotMatch(result.reply, /te apunto/i);
});

test("bookingFlowService interpreta fechas numericas con barras", async () => {
  const result = await handleBookingFlow({
    userMessage: "22/06/2099",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Laura" },
      { role: "assistant", content: "¿Qué servicio quieres?" },
      { role: "user", content: "1" },
      { role: "assistant", content: "¿Qué día te viene bien?" }
    ],
    conversationId: "test-numeric-date"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /lunes 22/i);
  assert.match(result.reply, /hora/i);
});

test("bookingFlowService no confunde una hora con fecha cuando el aviso menciona lunes y viernes", async () => {
  const result = await handleBookingFlow({
    userMessage: "a las 09:00",
    history: [
      { role: "user", content: "quiero reservar una cita" },
      { role: "assistant", content: "¿A nombre de quién pongo la reserva?" },
      { role: "user", content: "Laura" },
      { role: "assistant", content: "¿Qué servicio quieres?" },
      { role: "user", content: "1" },
      { role: "assistant", content: "¿Qué día te viene bien?" },
      { role: "user", content: "01/07/2099" },
      {
        role: "assistant",
        content:
          "Perfecto, para el miercoles 1. ¿A qué hora te viene bien? Abrimos de lunes a viernes de 10:00 a 20:00."
      }
    ],
    conversationId: "test-time-after-weekday-message"
  });

  assert.equal(result.handled, true);
  assert.equal(result.saved, false);
  assert.match(result.reply, /terminar el servicio|10:00 a 20:00/i);
  assert.doesNotMatch(result.reply, /no reconozco esa fecha/i);
});
