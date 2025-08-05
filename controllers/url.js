const shortid = require("shortid");
const URL = require('../models/url');

// Example Express handler
async function handleGenerateNewShortURL(req, res) {
    const { url } = req.body;
    const normalizedUrl = url.trim().toLowerCase();

    const existingUrl = await URL.findOne({ redirectURL: normalizedUrl });

    let shortID;

    if (existingUrl) {
        // If the URL already exists, use its shortID and also show a alert box telling the user that the URL already exists
        shortID = existingUrl.shortID;

        // Show an alert box with the existing short URL
        res.locals.alert = {
            type: "info",
            message: "URL already exists. Here is your shortened URL:",
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
