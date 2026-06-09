import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SmartFile API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});