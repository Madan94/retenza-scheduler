const prisma = require("../utils/prisma");

const createTemplate = async (req, res) => {
  try {
    const { name, content, channel } = req.body;

    const template = await prisma.template.create({
      data: {
        name,
        content,
        channel,
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
  getTemplates,
};