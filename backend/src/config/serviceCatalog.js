const BASE_SERVICES = [
  {
    key: "corte",
    label: "Corte",
    publicLabel: "Corte de cabello",
    aliases: ["corte", "corte de cabello", "cortar", "cortar pelo", "cortar el pelo"],
    price: 20,
    duration: 30
  },
  {
    key: "tinte",
    label: "Tinte",
    publicLabel: "Tinte profesional",
    aliases: ["tinte", "color", "coloracion", "coloración", "mechas", "tinte profesional"],
    price: 40,
    duration: 60
  },
  {
    key: "peinado",
    label: "Peinado",
    publicLabel: "Peinado especial",
    aliases: ["peinado", "recogido", "peinar", "peinado especial"],
    price: 15,
    duration: 20
  }
];

const SERVICE_ORDER = ["corte", "tinte", "peinado"];

function buildCombination(keys) {
  const services = SERVICE_ORDER.filter((key) => keys.includes(key));
  const baseItems = services.map((key) => BASE_SERVICES.find((service) => service.key === key));
  return {
    key: services.join("-"),
    label: baseItems.map((service) => service.label).join(" y "),
    publicLabel: baseItems.map((service) => service.publicLabel).join(" + "),
    aliases: [],
    price: baseItems.reduce((total, service) => total + service.price, 0),
    duration: baseItems.reduce((total, service) => total + service.duration, 0)
  };
}

export const SERVICE_CATALOG = Object.freeze([
  ...BASE_SERVICES,
  buildCombination(["corte", "peinado"]),
  buildCombination(["tinte", "peinado"]),
  buildCombination(["corte", "tinte"]),
  buildCombination(["corte", "tinte", "peinado"])
]);

export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[+/,.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveService(rawService) {
  const normalized = getPositiveServiceIntent(normalizeText(rawService));
  if (!normalized) {
    return null;
  }

  const direct = SERVICE_CATALOG.find((service) => normalizeText(service.label) === normalized);
  if (direct) {
    return direct;
  }

  const detectedKeys = new Set();
  for (const service of BASE_SERVICES) {
    const hasAlias = service.aliases.some((alias) => normalized.includes(normalizeText(alias)));
    if (hasAlias) {
      detectedKeys.add(service.key);
    }
  }

  if (detectedKeys.size === 0) {
    return null;
  }

  const key = SERVICE_ORDER.filter((serviceKey) => detectedKeys.has(serviceKey)).join("-");
  return SERVICE_CATALOG.find((service) => service.key === key) || null;
}

function getPositiveServiceIntent(normalized) {
  if (!normalized) {
    return "";
  }

  const preferenceMatches = [...normalized.matchAll(/\b(?:quiero|querria|necesito|prefiero|ponme|reservame)\b/g)];
  const contrastMatches = [...normalized.matchAll(/\b(?:pero|sino|mejor|en vez de)\b/g)];
  const lastPreference = preferenceMatches.at(-1);
  const lastContrast = contrastMatches.at(-1);

  if (preferenceMatches.length === 1 && /\bno\s+(?:quiero|querria|necesito|prefiero)\b/.test(normalized)) {
    return "";
  }

  let startIndex = 0;
  if (preferenceMatches.length > 1 && lastPreference) {
    startIndex = lastPreference.index + lastPreference[0].length;
  }
  if (lastContrast && lastContrast.index + lastContrast[0].length > startIndex) {
    startIndex = lastContrast.index + lastContrast[0].length;
  }

  return normalized
    .slice(startIndex)
    .replace(/\b(?:no|sin)\s+(?:quiero\s+|querria\s+|necesito\s+|prefiero\s+)?(?:un\s+|una\s+|el\s+|la\s+)?(?:corte|tinte|coloracion|mechas|peinado|recogido)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getServiceByLabel(label) {
  const normalized = normalizeText(label);
  return SERVICE_CATALOG.find((service) => normalizeText(service.label) === normalized) || null;
}

export function getServiceByOption(option) {
  const index = Number.parseInt(String(option || "").trim(), 10);

  if (!Number.isInteger(index) || index < 1 || index > SERVICE_CATALOG.length) {
    return null;
  }

  return {
    option: index,
    ...SERVICE_CATALOG[index - 1]
  };
}

export function formatNumberedServices() {
  return SERVICE_CATALOG.map((service, index) => {
    return `${index + 1}. ${service.label} - ${service.price} euros (${service.duration} min)`;
  }).join("\n");
}
