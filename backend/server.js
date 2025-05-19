const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const logFilePath = path.join(__dirname, "chat_logs.json");

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "[]");
}

app.post("/api/log", (req, res) => {
  const newEntry = req.body;

  try {
    const currentData = JSON.parse(fs.readFileSync(logFilePath, "utf8"));
    currentData.push(newEntry);
    fs.writeFileSync(logFilePath, JSON.stringify(currentData, null, 2));
    res.status(200).send({ message: "Log entry saved." });
  } catch (error) {
    console.error("Error saving log:", error);
    res.status(500).send({ error: "Failed to save log." });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Server running on http://localhost:${PORT}`);
});
