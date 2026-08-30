const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "AQ.Ab8RN6IVvqhRg-WNWOACA6fOVhmxiEGTs7trcIqfi52-AZX6FQ"
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say hello",
    });

    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}

test();