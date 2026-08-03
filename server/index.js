const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const transcriptionRoutes = require("./routes/transcription.routes");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

mongoose
    .connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

app.get("/", (req, res) => {
    res.send("CaptionFlow API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/transcriptions", transcriptionRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
