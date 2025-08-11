const shortid = require("shortid");
const URL = require('../models/url');
const QRCode = require('qrcode');

// Create QR Code helper
async function createQRCode(shortID) {
    const url = `${process.env.BASE_URL}/url/${shortID}`;
    try {
        return await QRCode.toDataURL(url);
    } catch (err) {
        console.error("QR Code generation failed:", err);
        return null;
    }
}

// Generate new short URL
async function handleGenerateNewShortURL(req, res) {
    const { url } = req.body;
    const normalizedUrl = url.trim().toLowerCase();

    let shortID;
    let alertMessage = null;

    try {
        // Check if same user already has this URL
        const existingUrl = await URL.findOne({
            redirectURL: normalizedUrl,
            createdBy: req.user._id
        });

        if (existingUrl) {
            shortID = existingUrl.shortID;
            alertMessage = {
                type: "info",
                message: "URL already exists for you:",
                url: `${process.env.BASE_URL}/url/${shortID}`
            };
        } else {
            shortID = shortid();
            await URL.create({
                shortID,
                redirectURL: normalizedUrl,
                visitHistory: [],
                createdBy: req.user._id,
                QR: await createQRCode(shortID),
            });
        }
    } catch (err) {
        if (err.code === 11000) {
            // Handle Mongo duplicate key error
            const existing = await URL.findOne({
                redirectURL: normalizedUrl,
                createdBy: req.user._id
            });
            if (existing) {
                shortID = existing.shortID;
                alertMessage = {
                    type: "info",
                    message: "URL already exists for you:",
                    url: `${process.env.BASE_URL}/url/${shortID}`
                };
            }
        } else {
            console.error("Error creating short URL:", err);
            return res.status(500).send("Internal Server Error");
        }
    }

    const qrCodeImage = await createQRCode(shortID);
    const urls = await URL.find({ createdBy: req.user._id });

    return res.render("home", {
        id: shortID,
        urls,
        alert: alertMessage,
        qrCode: qrCodeImage,
        baseUrl: process.env.BASE_URL,
    });
}

// Get analytics
async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortID: shortId });

    if (!result) {
        return res.status(404).json({ error: "Short ID not found" });
    }

    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory
    });
}

module.exports = {
    handleGenerateNewShortURL,
    handleGetAnalytics,
};
