const shortid = require("shortid");
const URL = require('../models/url');

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
            url: `http://localhost:8001/url/${shortID}`
        };
    } else {
        shortID = shortid();
        await URL.create({
            shortID,
            redirectURL: normalizedUrl,
            visitHistory: [],
            createdBy: req.user._id,
        });
    }

    const urls = await URL.find({ createdBy: req.user._id });

    return res.render("home", {
        id: shortID,
        urls: urls,
        alert: alertMessage
    });
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
