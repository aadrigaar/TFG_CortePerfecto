import { env } from "../config/env.js";

export function notFoundMiddleware(req, res, next) {
  res.status(404);
  next(new Error(`Ruta no encontrada: ${req.originalUrl}`));
}

export function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || res.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Error interno del servidor",
    code: error.code || "SERVER_ERROR",
    details: error.details || null,
    stack: env.nodeEnv === "production" ? undefined : error.stack
  });
}

