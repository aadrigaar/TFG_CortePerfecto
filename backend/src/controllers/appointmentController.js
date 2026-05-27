import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointmentStats,
  listAppointments,
  updateAppointment
} from "../services/appointmentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const appointments = await listAppointments(req.query);
  res.json({ success: true, appointments });
});

export const show = asyncHandler(async (req, res) => {
  const appointment = await getAppointmentById(req.params.id);
  res.json({ success: true, appointment });
});

export const store = asyncHandler(async (req, res) => {
  const appointment = await createAppointment(req.body, "admin");
  res.status(201).json({ success: true, appointment });
});

export const update = asyncHandler(async (req, res) => {
  const appointment = await updateAppointment(req.params.id, req.body);
  res.json({ success: true, appointment });
});

export const destroy = asyncHandler(async (req, res) => {
  await deleteAppointment(req.params.id);
  res.json({ success: true });
});

export const stats = asyncHandler(async (req, res) => {
  const summary = await getAppointmentStats();
  res.json({ success: true, summary });
});

