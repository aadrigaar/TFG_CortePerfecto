import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureDefaultAdmin } from "./services/adminService.js";
import { syncServiceCatalog } from "./services/serviceCatalogService.js";

async function bootstrap() {
  try {
    await connectDatabase();

    if (env.autoSeedAdmin) {
      await ensureDefaultAdmin();
    }

    await syncServiceCatalog();

    app.listen(env.port, () => {
      console.log(`[server] API escuchando en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("[server] No se pudo iniciar la API");
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
