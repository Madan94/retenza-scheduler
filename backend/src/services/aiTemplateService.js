const axios = require("axios");

async function generateTemplate({ prompt, channel, tone = "professional" }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured on the server");
    error.statusCode = 503;
    throw error;
  }

  const channelRules =
    channel === "telegram"
      ? "Keep content under 400 characters. Plain text only, no HTML."
      : "Write clear email body text. You may use short paragraphs.";

  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You create message templates for a scheduling app.
Channel: ${channel}.
Tone: ${tone}.
${channelRules}
Respond with JSON only: {"name":"short template title","content":"message body"}.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
    }
  );

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from AI provider");
  }

  const parsed = JSON.parse(raw);
  if (!parsed.name?.trim() || !parsed.content?.trim()) {
    throw new Error("AI response missing name or content");
  }

  return {
    name: parsed.name.trim(),
    content: parsed.content.trim(),
    channel,
    isAiGenerated: true,
    aiPrompt: prompt,
  };
}

module.exports = { generateTemplate };
