import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Appointment from "../src/models/Appointment.js";
import Service from "../src/models/Service.js";
import {
  createAppointment,
  deleteAppointment,
  listAppointments,
  updateAppointment
} from "../src/services/appointmentService.js";
import { listPublicServices, syncServiceCatalog } from "../src/services/serviceCatalogService.js";

const mongoUri = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017/corte_perfecto_test";

test.before(async () => {
  await mongoose.connect(mongoUri);
});

test.beforeEach(async () => {
  await Appointment.deleteMany({});
});

test.after(async () => {
  await Appointment.deleteMany({});
  await Service.deleteMany({});
  await mongoose.disconnect();
});

test("appointmentService crea citas validas con precio, duracion y estado", async () => {
  const appointment = await createAppointment(
    {
      customerName: "Adrian",
      service: "Corte y Tinte",
      date: "2099-06-22",
      time: "10:00"
    },
    "chat"
  );

  assert.equal(appointment.customerName, "Adrian");
  assert.equal(appointment.service, "Corte y Tinte");
  assert.equal(appointment.price, 60);
  assert.equal(appointment.duration, 90);
  assert.equal(appointment.status, "confirmed");
  assert.equal(appointment.source, "chat");
});

test("appointmentService rechaza fin de semana, hora fuera de horario y nombres invalidos", async () => {
  await assert.rejects(
    () =>
      createAppointment({
        customerName: "Adrian",
        service: "Corte",
        date: "2099-06-20",
        time: "10:00"
      }),
    { code: "WEEKEND_CLOSED" }
  );

  await assert.rejects(
    () =>
      createAppointment({
        customerName: "Adrian",
        service: "Corte",
        date: "2099-06-22",
        time: "09:00"
      }),
    { code: "OUTSIDE_BUSINESS_HOURS" }
  );

  await assert.rejects(
    () =>
      createAppointment({
        customerName: "Adrian",
        service: "Corte y Tinte y Peinado",
        date: "2099-06-22",
        time: "18:15"
      }),
    { code: "OUTSIDE_BUSINESS_HOURS" }
  );

  await assert.rejects(
    () =>
      createAppointment({
        customerName: "ok",
        service: "Corte",
        date: "2099-06-22",
        time: "10:00"
      }),
    { code: "INVALID_CUSTOMER_NAME" }
  );
});

test("appointmentService evita solapes entre citas activas", async () => {
  await createAppointment({
    customerName: "Adrian",
    service: "Corte",
    date: "2099-06-22",
    time: "10:00"
  });

  await assert.rejects(
    () =>
      createAppointment({
        customerName: "Laura",
        service: "Peinado",
        date: "2099-06-22",
        time: "10:15"
      }),
    { code: "SLOT_UNAVAILABLE" }
  );
});

test("appointmentService permite completar y eliminar citas desde administracion", async () => {
  const appointment = await createAppointment({
    customerName: "Adrian",
    service: "Corte",
    date: "2099-06-22",
    time: "12:00"
  });

  const completed = await updateAppointment(appointment.id, { status: "completed" });
  assert.equal(completed.status, "completed");

  const appointments = await listAppointments({ status: "completed" });
  assert.equal(appointments.length, 1);

  const deleted = await deleteAppointment(appointment.id);
  assert.equal(deleted.id, appointment.id);

  const remaining = await listAppointments();
  assert.equal(remaining.length, 0);
});

test("serviceCatalogService sincroniza el catalogo oficial en la coleccion servicios", async () => {
  await Service.deleteMany({});
  await syncServiceCatalog();

  const services = await listPublicServices();

  assert.equal(services.length, 7);
  assert.equal(services[0].label, "Corte");
  assert.equal(services[5].label, "Corte y Tinte");
  assert.equal(services[5].price, 60);
  assert.equal(services[5].duration, 90);
});
