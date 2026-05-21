const express = require("express");
const router = express.Router();

const {
  createSchedule,
  getSchedules,
  cancelSchedule,
} = require("../controllers/scheduleController");

router.post("/", createSchedule);
router.get("/", getSchedules);
router.patch("/:id/cancel", cancelSchedule);

module.exports = router;