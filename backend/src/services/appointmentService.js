import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import { resolveService } from "../config/serviceCatalog.js";
import { AppError } from "../utils/AppError.js";
import { formatMadridTime, getWeekdayName, isWeekendDateString, madridNow } from "./calendarService.js";

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
  "no",
  "cancelar",
  "anular",
  "sin nombre",
  "anonimo",
  "anónimo"
]);
const ACTIVE_STATUSES = ["pending", "confirmed"];
const OPEN_MINUTES = 10 * 60;
const CLOSE_MINUTES = 20 * 60;
let appointmentWriteQueue = Promise.resolve();

export async function listAppointments(filters = {}) {
  const query = {};

  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  if (filters.date) {
    query.date = filters.date;
  }

  if (filters.dateFrom || filters.dateTo) {
    query.startsAt = {
      ...(filters.dateFrom ? { $gte: new Date(`${filters.dateFrom}T00:00:00`) } : {}),
      ...(filters.dateTo ? { $lte: new Date(`${filters.dateTo}T23:59:59`) } : {})
    };
  }

  if (filters.upcoming === "true") {
    query.startsAt = { ...(query.startsAt || {}), $gte: new Date() };
    query.status = { $in: ACTIVE_STATUSES };
  }

  const sortDirection = filters.sort === "desc" ? -1 : 1;
  return Appointment.find(query).sort({ startsAt: sortDirection }).lean();
}

export async function getAppointmentById(id) {
  assertObjectId(id);
  const appointment = await Appointment.findById(id).lean();

  if (!appointment) {
    throw new AppError("Cita no encontrada", 404, "APPOINTMENT_NOT_FOUND");
  }

  return appointment;
}

export function createAppointment(payload, source = "admin") {
  return withAppointmentWriteLock(async () => {
    const data = buildAppointmentData(payload, source);
    await assertSlotAvailable(data.startsAt, data.endsAt);
    return Appointment.create(data);
  });
}

export function updateAppointment(id, payload, options = {}) {
  return withAppointmentWriteLock(async () => {
    assertObjectId(id);
    const existing = await Appointment.findById(id);

    if (!existing) {
      throw new AppError("Cita no encontrada", 404, "APPOINTMENT_NOT_FOUND");
    }

    if (
      Object.hasOwn(options, "expectedConversationId") &&
      (!options.expectedConversationId || existing.conversationId !== options.expectedConversationId)
    ) {
      throw new AppError("Cita activa no encontrada para esta conversación", 404, "APPOINTMENT_NOT_FOUND");
    }

    const merged = {
      customerName: payload.customerName ?? existing.customerName,
      service: payload.service ?? existing.service,
      date: payload.date ?? existing.date,
      time: payload.time ?? existing.time,
      status: payload.status ?? existing.status,
      notes: payload.notes ?? existing.notes,
      conversationId: payload.conversationId ?? existing.conversationId,
      source: payload.source ?? existing.source
    };

    const data = buildAppointmentData(merged, merged.source);

    if (merged.status) {
      data.status = merged.status;
    }

    if (typeof merged.notes === "string") {
      data.notes = merged.notes;
    }

    await assertSlotAvailable(data.startsAt, data.endsAt, id);

    Object.assign(existing, data);
    await existing.save();
    return existing;
  });
}

export async function deleteAppointment(id) {
  assertObjectId(id);
  const deleted = await Appointment.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Cita no encontrada", 404, "APPOINTMENT_NOT_FOUND");
  }

  return deleted;
}

export async function getAppointmentStats() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayCount, pending, confirmed, completed, total, revenueResult] = await Promise.all([
    Appointment.countDocuments({ startsAt: { $gte: today, $lt: tomorrow }, status: { $ne: "cancelled" } }),
    Appointment.countDocuments({ status: "pending" }),
    Appointment.countDocuments({ status: "confirmed" }),
    Appointment.countDocuments({ status: "completed" }),
    Appointment.countDocuments(),
    Appointment.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ])
  ]);

  return {
    today: todayCount,
    pending,
    confirmed,
    completed,
    total,
    estimatedRevenue: revenueResult[0]?.total || 0
  };
}

function buildAppointmentData(payload, source) {
  const customerName = validateCustomerName(payload.customerName);
  const serviceConfig = resolveService(payload.service);

  if (!serviceConfig) {
    throw new AppError("Servicio no valido", 400, "INVALID_SERVICE");
  }

  const { date, time, startsAt, endsAt } = validateDateTime(payload.date, payload.time, serviceConfig.duration);

  return {
    customerName,
    service: serviceConfig.label,
    price: serviceConfig.price,
    duration: serviceConfig.duration,
    date,
    time,
    startsAt,
    endsAt,
    status: payload.status || "confirmed",
    source,
    notes: payload.notes || "",
    conversationId: payload.conversationId || ""
  };
}

function validateCustomerName(rawName) {
  const name = String(rawName || "").trim().replace(/\s+/g, " ");
  const normalized = name.toLowerCase();
  const words = normalized.split(" ").filter(Boolean);

  if (
    name.length < 2 ||
    name.length > 80 ||
    words.length > 6 ||
    INVALID_NAMES.has(normalized) ||
    /\b(?:quiero|querria|necesito|reservar|cita|servicio|corte|tinte|peinado|telefono)\b/.test(normalized)
  ) {
    throw new AppError("Necesito un nombre real para registrar la cita.", 400, "INVALID_CUSTOMER_NAME");
  }

  if (!/^[a-zA-ZÀ-ÿñÑ\s'-]+$/.test(name)) {
    throw new AppError("El nombre contiene caracteres no validos.", 400, "INVALID_CUSTOMER_NAME");
  }

  return name;
}

function validateDateTime(rawDate, rawTime, duration) {
  const date = String(rawDate || "").trim();
  const time = String(rawTime || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError("Fecha no valida", 400, "INVALID_DATE");
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new AppError("Hora no valida", 400, "INVALID_TIME");
  }

  if (isWeekendDateString(date)) {
    const weekday = getWeekdayName(date);
    throw new AppError(`Lo siento, el ${weekday} estamos cerrados por descanso.`, 400, "WEEKEND_CLOSED");
  }

  const [hours, minutes] = time.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;

  if (startMinutes < OPEN_MINUTES || endMinutes > CLOSE_MINUTES) {
    throw new AppError("El horario disponible es de lunes a viernes, de 10:00 a 20:00.", 400, "OUTSIDE_BUSINESS_HOURS");
  }

  const startsAt = new Date(`${date}T${time}:00`);
  const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000);

  if (Number.isNaN(startsAt.getTime())) {
    throw new AppError("Fecha u hora no valida", 400, "INVALID_DATETIME");
  }

  const now = madridNow();
  if (startsAt.getTime() <= now.getTime()) {
    throw new AppError(
      `Esa hora ya ha pasado. Ahora son las ${formatMadridTime(now)}. Elige una hora futura dentro del horario de 10:00 a 20:00.`,
      400,
      "PAST_DATETIME"
    );
  }

  return { date, time, startsAt, endsAt };
}

async function assertSlotAvailable(startsAt, endsAt, ignoredId = null) {
  const query = {
    status: { $in: ACTIVE_STATUSES },
    startsAt: { $lt: endsAt },
    endsAt: { $gt: startsAt }
  };

  if (ignoredId) {
    query._id = { $ne: ignoredId };
  }

  const conflict = await Appointment.findOne(query).lean();

  if (conflict) {
    throw new AppError(
      `Ese hueco ya esta ocupado por ${conflict.customerName} (${conflict.service}).`,
      409,
      "SLOT_UNAVAILABLE"
    );
  }
}

function assertObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Identificador no valido", 400, "INVALID_ID");
  }
}

function withAppointmentWriteLock(operation) {
  const result = appointmentWriteQueue.then(operation, operation);
  appointmentWriteQueue = result.catch(() => {});
  return result;
}
