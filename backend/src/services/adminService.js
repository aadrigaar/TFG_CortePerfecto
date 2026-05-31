import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function ensureDefaultAdmin() {
  const username = normalizeUsername(env.adminUsername);
  const existingAdmin = await Admin.findOne({ username });

  if (existingAdmin?.passwordHash) {
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  const admin = await Admin.findOneAndUpdate(
    { username },
    {
      username,
      passwordHash,
      role: "admin"
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`[admin] Admin inicial preparado: ${username}`);
  return admin;
}

export async function authenticateAdmin({ username, password }) {
  const normalizedUsername = normalizeUsername(username);
  const plainPassword = String(password || "");

  if (!normalizedUsername || !plainPassword) {
    throw new AppError("Usuario y contrasena son obligatorios", 400, "VALIDATION_ERROR");
  }

  const admin = await Admin.findOne({ username: normalizedUsername });
  const isValidPassword = admin ? await bcrypt.compare(plainPassword, admin.passwordHash) : false;

  if (!admin || !isValidPassword) {
    throw new AppError("Credenciales incorrectas", 401, "INVALID_CREDENTIALS");
  }

  return {
    token: signAdminToken(admin),
    admin: serializeAdmin(admin)
  };
}

export async function getAdminFromToken(token) {
  if (!token) {
    throw new AppError("No autenticado", 401, "AUTH_REQUIRED");
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await Admin.findById(payload.sub).select("-passwordHash");

    if (!admin) {
      throw new AppError("Sesion no valida", 401, "INVALID_SESSION");
    }

    return admin;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Token invalido o caducado", 401, "INVALID_TOKEN");
  }
}

function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, role: admin.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

function serializeAdmin(admin) {
  return {
    id: admin.id,
    username: admin.username,
    role: admin.role
  };
}

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}
