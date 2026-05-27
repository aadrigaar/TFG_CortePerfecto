import mongoose from "mongoose";
import axios from "axios";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const health = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    service: "Corte Perfecto API",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    lmStudio: {
      baseUrl: env.lmStudioBaseUrl,
      model: env.lmStudioModel
    }
  });
});

export const lmStudioHealth = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${env.lmStudioBaseUrl}/models`, {
      timeout: 5000
    });

    res.json({
      success: true,
      reachable: true,
      models: response.data?.data || []
    });
  } catch {
    res.status(503).json({
      success: false,
      reachable: false,
      message: "LM Studio no responde en el endpoint configurado"
    });
  }
});

