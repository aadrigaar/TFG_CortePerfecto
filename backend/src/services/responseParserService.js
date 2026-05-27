export function parseAssistantResponse(rawContent = "") {
  const content = String(rawContent || "").trim();
  const appointmentCandidate = extractAppointmentJson(content);
  const reply = extractCustomerReply(content);

  return {
    reply,
    appointmentCandidate,
    rawContent: content
  };
}

function extractCustomerReply(content) {
  const marker = "### RESPUESTA:";
  const markerIndex = content.lastIndexOf(marker);
  const selected = markerIndex >= 0 ? content.slice(markerIndex + marker.length) : content;

  return selected
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/gi, "")
    .replace(/\{[\s\S]*"nombre"[\s\S]*\}/gi, "")
    .replace(/### RESPUESTA:/gi, "")
    .trim();
}

function extractAppointmentJson(content) {
  const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidates = [];

  if (codeBlockMatch?.[1]) {
    candidates.push(codeBlockMatch[1]);
  }

  const objectMatch = content.match(/\{[\s\S]*"nombre"[\s\S]*?\}/i);
  if (objectMatch?.[0]) {
    candidates.push(objectMatch[0]);
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (parsed.nombre && parsed.servicio && parsed.fecha && parsed.hora) {
        return {
          customerName: parsed.nombre,
          service: parsed.servicio,
          date: parsed.fecha,
          time: parsed.hora
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

