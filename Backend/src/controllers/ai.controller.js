import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generatePreConsultationSummary } from "../services/ai.service.js";





const createPreConsultationSummary = asyncHandler(async (req, res) => {

    const { symptoms } = req.body;

    // Validate symptoms
    if (typeof symptoms !== "string" || !symptoms.trim()) {
        throw new ApiError(400, "Please provide your symptoms");
    }

    // Limit input size
    const cleanedSymptoms = symptoms.trim();

    if (cleanedSymptoms.length > 2000) {
        throw new ApiError(
            400,
            "Symptoms cannot exceed 2000 characters"
        );
    }

    // Generate summary using Gemini
    const summary = await generatePreConsultationSummary(
        cleanedSymptoms
    );

    // Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            summary,
            "Pre-consultation summary generated successfully"
        )
    );
});

export {
    createPreConsultationSummary
};