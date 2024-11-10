const shortid = require("shortid");
const URL = require('../models/url');

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;

    if (!body.url) return res.status(400).json({ error: "url is required" });

    const shortID = shortid();

    await URL.create({
        shortID: shortID,  // Use the correct field name
        redirectURL: body.url,
        visitHistory: [],
        createdBy: req.user._id,
    });

    return res.render('home', {
        id: shortID,
    })
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
