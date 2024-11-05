const express = require("express");
const { connectToMongoDB } = require('./connect');
const urlRoute = require('./routes/url');
const URL = require('./models/url');

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
    console.log('Mongodb connected')
);

// Middleware 
app.use(express.json());

app.use("/url", urlRoute);

// Redirect route
app.get('/:shortId', async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findOneAndUpdate(
            { 
                shortID: shortId,  // Use consistent field name
            },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    },
                },
            },
            { new: true }
        );

        if (!entry) {
            return res.status(404).send('URL not found');
        }

        // Redirect to the stored URL
        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
