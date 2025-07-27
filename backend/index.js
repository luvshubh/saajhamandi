import express from "express";
import connectDB from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
