import { GoogleGenAI, Type } from "@google/genai";
import { RunAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRunImage = async (base64Image: string): Promise<RunAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: `Ты — профессиональный тренер по бегу. Проанализируй это изображение.
            
            1. Если это фото экрана беговой дорожки или смарт-часов, попытайся извлечь:
               - Дистанцию (в километрах).
               - Время (в минутах).
            2. Если данных нет, оцени место пробежки (лес, город, стадион) по фото.
            3. Напиши короткий, мотивирующий комментарий на русском языке (максимум 2 предложения), основываясь на увиденном.
            
            Верни ответ строго в формате JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distance: { type: Type.NUMBER, description: "Distance in km if visible, else null" },
            duration: { type: Type.NUMBER, description: "Duration in minutes if visible, else null" },
            notes: { type: Type.STRING, description: "Short description of the environment or context" },
            feedback: { type: Type.STRING, description: "Motivational feedback in Russian" }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as RunAnalysis;
    }
    return {};
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      feedback: "Не удалось проанализировать фото, но пробежка — это всегда круто!"
    };
  }
};

export const generateWeeklyAdvice = async (totalDistance: number, runCount: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `У бегуна за эту неделю такая статистика: ${totalDistance} км за ${runCount} пробежек.
      Дай очень краткий совет (одно предложение) на следующую неделю на русском языке.`,
    });
    return response.text || "Продолжай в том же духе!";
  } catch (e) {
    return "Отличная работа на этой неделе!";
  }
}