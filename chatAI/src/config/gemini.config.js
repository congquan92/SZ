import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in .env");
}

export const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
