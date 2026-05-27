import { listPublicServices } from "../services/serviceCatalogService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const services = await listPublicServices();

  res.json({
    success: true,
    services
  });
});
