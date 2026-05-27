import { SERVICE_CATALOG } from "../config/serviceCatalog.js";
import Service from "../models/Service.js";

export function mapCatalogToServiceDocument(service, index) {
  return {
    id: index + 1,
    key: service.key,
    nombre: service.label,
    descripcion: service.publicLabel,
    precio: service.price,
    duracion_minutos: service.duration
  };
}

export async function syncServiceCatalog() {
  const operations = SERVICE_CATALOG.map((service, index) => ({
    updateOne: {
      filter: { id: index + 1 },
      update: { $set: mapCatalogToServiceDocument(service, index) },
      upsert: true
    }
  }));

  if (operations.length === 0) {
    return;
  }

  await Service.bulkWrite(operations);
}

export async function listPublicServices() {
  const services = await Service.find().sort({ id: 1 }).lean();

  if (services.length > 0) {
    return services.map((service) => ({
      id: service.id,
      key: service.key,
      label: service.nombre,
      publicLabel: service.descripcion,
      price: service.precio,
      duration: service.duracion_minutos
    }));
  }

  return SERVICE_CATALOG.map((service, index) => ({
    id: index + 1,
    ...service
  }));
}
