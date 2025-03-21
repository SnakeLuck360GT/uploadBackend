// Install dependencies: express, multer, axios, cors
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; // Store in Render Environment Variables

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded.");
    
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            username: "Image Uploader",
            embeds: [{
                title: "New Image Uploaded",
                description: `IP: \`${ip}\`\\nFilename: \`${file.originalname}\``,
                color: 16711680,
            }],
        }, {
            headers: { "Content-Type": "application/json" }
        });

        res.send("File uploaded and sent to Discord.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading file.");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
