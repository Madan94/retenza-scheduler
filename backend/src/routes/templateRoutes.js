const express = require("express");
const router = express.Router();

const {
  createTemplate,
  getTemplates,
} = require("../controllers/templateController");

router.post("/", createTemplate);
router.get("/", getTemplates);

module.exports = router;