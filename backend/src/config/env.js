import dotenv from "dotenv";

dotenv.config({ quiet: true });

const defaultJwtSecret = "cambia-este-secreto-en-produccion";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/corte_perfecto",
  jwtSecret: process.env.JWT_SECRET || defaultJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  autoSeedAdmin: String(process.env.AUTO_SEED_ADMIN || "true") === "true",
  lmStudioBaseUrl: process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
  lmStudioModel: process.env.LMSTUDIO_MODEL || "meta-llama-3.1-8b-instruct",
  lmStudioTimeoutMs: Number(process.env.LMSTUDIO_TIMEOUT_MS || 60000)
};

export const corsOrigins = env.clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (env.nodeEnv === "production" && env.jwtSecret === defaultJwtSecret) {
  throw new Error("JWT_SECRET debe configurarse en produccion.");
}
