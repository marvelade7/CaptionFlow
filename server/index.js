const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const transcriptionRoutes = require("./routes/transcription.routes");
const aiSummaryRoutes = require('./routes/aiSummary.route');


const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 30000, // 30s before giving up on server selection
    socketTimeoutMS: 60000,          // 60s idle socket timeout
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// Log but don't crash on transient network errors — Mongoose auto-reconnects
mongoose.connection.on("error", (err) =>
  console.error("⚠️  MongoDB error:", err.message)
);
mongoose.connection.on("disconnected", () =>
  console.warn("⚠️  MongoDB disconnected — will reconnect automatically")
);

app.get("/", (req, res) => {
  res.send("CaptionFlow API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/transcriptions", transcriptionRoutes);
app.use('/api/ai-summary', aiSummaryRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
