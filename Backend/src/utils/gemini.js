import { GoogleGenAI } from "@google/genai";

console.log(
    "Gemini key loaded:",
    process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default ai;