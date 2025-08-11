const shortid = require("shortid");
const URL = require('../models/url');
const QRCode = require('qrcode');

// Example Express handler
async function handleGenerateNewShortURL(req, res) {
    const { url } = req.body;
    const normalizedUrl = url.trim().toLowerCase();

    let shortID;
    let alertMessage = null;

    const existingUrl = await URL.findOne({ redirectURL: normalizedUrl });

    if (existingUrl) {
        shortID = existingUrl.shortID;
        alertMessage = {
            type: "info",
            message: "URL already exists:",
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

    // ✅ Generate QR Code
    const qrCodeImage = await createQRCode(shortID);

    // Get all URLs created by this user
    const urls = await URL.find({ createdBy: req.user._id });

    return res.render("home", {
        id: shortID,
        urls: urls,
        alert: alertMessage,
        qrCode: qrCodeImage, // ✅ Pass QR code to template
        baseUrl: process.env.BASE_URL,
    });
}


async function createQRCode(shortID) {
    const url = `${process.env.BASE_URL}/url/${shortID}`;

    try {
        const qrCodeImage = await QRCode.toDataURL(url);
        return qrCodeImage;
    } catch (err) {
        console.error("QR Code generation failed:", err);
        return null;
    }
}




async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortID: shortId }); // Use consistent field name

    // if (!result) {
    //     return res.status(404).json({ error: "Short ID not found" }); // Handle not found
    // }

    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory
    });
}

module.exports = {
    handleGenerateNewShortURL,
    handleGetAnalytics,
};
