import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ensureDefaultAdmin } from "../services/adminService.js";

async function seed() {
  await mongoose.connect(env.mongodbUri);
  await ensureDefaultAdmin();

  console.log(`Admin preparado: ${env.adminUsername}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
