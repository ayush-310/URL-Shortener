const express = require('express');
const router = express.Router();
const URL = require('../models/url'); // Import your URL model here

router.get('/', async (req, res) => {
    try {
        const allurls = await URL.find({});
        return res.render('home', {
            urls: allurls,
        });
    } catch (error) {
        console.error("Error fetching URLs:", error);
        res.status(500).send("Error fetching URLs");
    }
});

module.exports = router;
