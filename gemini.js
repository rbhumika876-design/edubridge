const { GoogleGenAI } = require("@google/genai");

// Initialize GoogleGenAI client using the API key loaded from environment variables
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function getAnswer(question, image) {
  try {
    let contents = [question];
    
    if (image && image.data && image.mimeType) {
      let base64Data = image.data;
      if (base64Data.includes("base64,")) {
        base64Data = base64Data.split("base64,")[1];
      }
      contents = [
        {
          inlineData: {
            mimeType: image.mimeType,
            data: base64Data
          }
        },
        question
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: "You are a concise, helpful AI tutor assisting students with their doubts on the EDUBRIDGE platform. Keep your explanations clear, accurate, easy to understand, and concise. Respond in PLAIN TEXT only. Do not use Markdown formatting (no asterisks **, hashtags #, dashes ---, or bullet symbols *). Use standard newlines/line breaks for paragraphs or lists. Keep math formulas simple and in standard plain text (do not use LaTeX).",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

module.exports = getAnswer;