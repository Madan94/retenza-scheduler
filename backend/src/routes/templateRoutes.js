const express = require("express");
const router = express.Router();

const {
  createTemplate,
  generateTemplateWithAi,
  getTemplates,
} = require("../controllers/templateController");

router.post("/generate", generateTemplateWithAi);
router.post("/", createTemplate);
router.get("/", getTemplates);

module.exports = router;