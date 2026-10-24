import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  generateConsultationQuestions,
} from "../services/ai.service.js";

const createPreConsultationSummary = asyncHandler(
  async (req, res) => {
    const { symptoms } = req.body;

    if (typeof symptoms !== "string" || !symptoms.trim()) {
      throw new ApiError(400, "Please provide your symptoms");
    }

    const cleanedSymptoms = symptoms.trim();

    if (cleanedSymptoms.length > 2000) {
      throw new ApiError(
        400,
        "Symptoms cannot exceed 2000 characters"
      );
    }

    const result = await generateConsultationQuestions(
      cleanedSymptoms
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Consultation questions generated successfully"
      )
    );
  }
);

export { createPreConsultationSummary };