const prisma = require("../utils/prisma");
const { generateTemplate } = require("../services/aiTemplateService");

const createTemplate = async (req, res) => {
  try {
    const {
      name,
      content,
      channel,
      isAiGenerated = false,
      aiPrompt,
    } = req.body;

    if (!name?.trim() || !content?.trim() || !channel) {
      return res.status(400).json({
        error: "name, content, and channel are required",
      });
    }

    const template = await prisma.template.create({
      data: {
        name: name.trim(),
        content: content.trim(),
        channel,
        isAiGenerated: Boolean(isAiGenerated),
        aiPrompt: aiPrompt?.trim() || null,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create template",
    });
  }
};

const generateTemplateWithAi = async (req, res) => {
  try {
    const { prompt, channel = "email", tone = "professional" } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "prompt is required" });
    }

    if (!["email", "telegram"].includes(channel)) {
      return res.status(400).json({
        error: "channel must be email or telegram",
      });
    }

    const generated = await generateTemplate({
      prompt: prompt.trim(),
      channel,
      tone,
    });

    res.json(generated);
  } catch (error) {
    console.log(error);

    if (error.statusCode === 503) {
      return res.status(503).json({ error: error.message });
    }

    if (error.response?.status === 401) {
      return res.status(502).json({
        error: "Invalid Gemini API key",
      });
    }

    if (error.response?.status === 402) {
      return res.status(402).json({
        error: error.response.data?.error?.message || "Gemini API: Insufficient Balance / Payment Required. Please check your account.",
      });
    }

    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || "Failed to generate template with AI",
    });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(templates);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch templates",
    });
  }
};

module.exports = {
  createTemplate,
  generateTemplateWithAi,
  getTemplates,
};
