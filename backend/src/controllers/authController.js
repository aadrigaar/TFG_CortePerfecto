import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!username || !password) {
    throw new AppError("Usuario y contrasena son obligatorios", 400, "VALIDATION_ERROR");
  }

  const admin = await Admin.findOne({ username });
  const isValidPassword = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

  if (!admin || !isValidPassword) {
    throw new AppError("Credenciales incorrectas", 401, "INVALID_CREDENTIALS");
  }

  const token = jwt.sign({ sub: admin.id, role: admin.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

