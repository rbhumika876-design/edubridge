const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: "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"
});

async function getAnswer(question) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  return chatCompletion.choices[0].message.content;
}

module.exports = getAnswer;