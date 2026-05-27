import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./env.js";
import Admin from "../models/Admin.js";
import { SERVICE_CATALOG } from "./serviceCatalog.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  console.log("[database] MongoDB conectado");

  if (env.autoSeedAdmin) {
    await ensureDefaultAdmin();
  }

  await ensureServicesCatalog();
}

async function ensureDefaultAdmin() {
  const existingAdmin = await Admin.findOne({ username: env.adminUsername });
  if (existingAdmin?.passwordHash) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await Admin.findOneAndUpdate(
    { username: env.adminUsername },
    {
      username: env.adminUsername,
      passwordHash,
      role: "admin"
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`[database] Admin inicial preparado: ${env.adminUsername}`);
}

async function ensureServicesCatalog() {
  const collection = mongoose.connection.db.collection("servicios");

  await Promise.all(
    SERVICE_CATALOG.map((service, index) => {
      return collection.updateOne(
        { id: index + 1 },
        {
          $set: {
            id: index + 1,
            nombre: service.label,
            descripcion: service.publicLabel,
            precio: service.price,
            duracion_minutos: service.duration,
            key: service.key,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    })
  );
}
