import axios from "axios";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function askLmStudio(messages) {
  try {
    const response = await axios.post(
      `${env.lmStudioBaseUrl}/chat/completions`,
      {
        model: env.lmStudioModel,
        messages,
        temperature: 0.2,
        max_tokens: 900,
        stream: false
      },
      {
        timeout: env.lmStudioTimeoutMs,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new AppError("LM Studio no devolvio una respuesta valida", 502, "LMSTUDIO_EMPTY_RESPONSE");
    }

    return content;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "No puedo conectar con LM Studio. Revisa que el servidor local este activo en http://127.0.0.1:1234.",
      503,
      "LMSTUDIO_UNAVAILABLE"
    );
  }
}

