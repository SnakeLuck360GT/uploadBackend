// Install dependencies: express, multer, axios, cors, form-data
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL";

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage(); // Store files in memory instead of disk
const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded.");
    
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    
    try {
        const formData = new FormData();
        formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });

        // Upload image directly to Discord webhook
        await axios.post(DISCORD_WEBHOOK_URL, formData, {
            headers: formData.getHeaders(),
        });

        // Send embed with image
        await axios.post(DISCORD_WEBHOOK_URL, {
            username: "Image Uploader",
            embeds: [{
                title: "New Image Uploaded",
                description: `IP: \`${ip}\`\nFilename: \`${file.originalname}\``,
                color: 16711680,
                image: { url: `attachment://${file.originalname}` }
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
