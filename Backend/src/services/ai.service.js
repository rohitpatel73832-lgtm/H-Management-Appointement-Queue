import ai from "../utils/gemini.js";

const generatePreConsultationSummary = async (symptoms) => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("AI service is not configured");
    error.statusCode = 503;
    throw error;
  }

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `
You are an assistant that prepares patient-provided information
for a doctor consultation.

Return only valid JSON in this format:
{
    "summary": "A short factual summary of the reported symptoms",
    "questionsForDoctor": [
        "Question one",
        "Question two"
    ]
}

Rules:
- Summarize only the information provided.
- Do not diagnose diseases.
- Do not recommend medicines or treatments.
- Do not invent symptoms or medical history.
- Provide 2 to 4 neutral questions for the doctor.
- This output must not replace a qualified clinician's assessment.

Patient-reported symptoms:
${symptoms}
            `,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    });

    const text = response.text;

    if (!text) {
      const error = new Error("AI returned an empty response");
      error.statusCode = 502;
      throw error;
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      const error = new Error("AI returned an invalid response");
      error.statusCode = 502;
      throw error;
    }

    if (
      typeof data.summary !== "string" ||
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

    // Log diagnostic information, never the API key or symptoms
    console.error("AI summary generation failed:", {
        name: error.name,
        message: error.message,
        status: error.status,
        code: error.code,
    });

    const serviceError = new Error(
        "AI service is temporarily unavailable"
    );

    serviceError.statusCode = 503;
    throw serviceError;
}

//   } catch (error) {
//     if (error.statusCode) {
//       throw error;
//     }

//     console.error("AI summary generation failed");

//     const serviceError = new Error("AI service is temporarily unavailable");
//     serviceError.statusCode = 503;
//     throw serviceError;


  }

//};

export { generatePreConsultationSummary };
