require("dotenv/config");
const express = require("express");
const cors = require("cors");

const templateRoutes = require("./routes/templateRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const recoverSchedules = require("./services/recoverSchedules");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Retenza Scheduler API Running",
  });
});

app.use("/templates", templateRoutes);
app.use("/schedules", scheduleRoutes);

app.listen(5000, async () => {
  console.log("Server running on port 5000");
  try {
    await recoverSchedules();
  } catch (error) {
    console.error("Failed to recover schedules:", error.message);
  }
});