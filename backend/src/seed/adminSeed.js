import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import Admin from "../models/Admin.js";

async function seed() {
  await mongoose.connect(env.mongodbUri);

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await Admin.findOneAndUpdate(
    { username: env.adminUsername.toLowerCase() },
    {
      username: env.adminUsername.toLowerCase(),
      passwordHash,
      role: "admin"
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`Admin preparado: ${env.adminUsername}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
