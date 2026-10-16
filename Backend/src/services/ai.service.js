import ai from "../utils/gemini.js";

const generatePreConsultationSummary = async (symptoms) => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("AI service is not configured");
    error.statusCode = 503;
    throw error;
  }

  try {
    const interaction = await ai.interactions.create({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

      input: `
You prepare patient-provided information for a doctor consultation.

Return only valid JSON with these fields:
{
    "summary": "A short factual summary of the reported symptoms",
    "questionsForDoctor": [
        "Question one",
        "Question two"
    ]
}

Rules:
- Summarize only what the patient reported.
- Do not diagnose diseases.
- Do not recommend medicines or treatments.
- Do not invent symptoms or medical history.
- Provide 2 to 4 neutral questions for the doctor.
- This is not a diagnosis.

Patient-reported symptoms:
${symptoms}
            `,

      store: false,
    });

    const text = interaction.output_text;

    if (!text) {
      const error = new Error("AI returned an empty response");
      error.statusCode = 502;
      throw error;
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      const error = new Error("AI returned invalid JSON");
      error.statusCode = 502;
      throw error;
    }

    if (
      typeof data.summary !== "string" ||
      !data.summary.trim() ||
      !Array.isArray(data.questionsForDoctor) ||
      !data.questionsForDoctor.every((question) => typeof question === "string")
    ) {
      const error = new Error("AI returned an invalid response format");
      error.statusCode = 502;
      throw error;
    }

    return {
      summary: data.summary,
      questionsForDoctor: data.questionsForDoctor.slice(0, 4),
      disclaimer:
        "This AI-generated summary is not a diagnosis. A qualified clinician must assess the symptoms.",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error("AI summary generation failed:", {
      name: error.name,
      message: error.message,
      status: error.status,
    });

    const serviceError = new Error(
      error.status === 503
        ? "Gemini is temporarily unavailable. Please try again later."
        : "AI service is temporarily unavailable"
    );

    serviceError.statusCode = error.status === 503 ? 503 : 502;
    throw serviceError;
  }
};

export { generatePreConsultationSummary };
