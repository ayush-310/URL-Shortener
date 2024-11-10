const express = require("express");
const { connectToMongoDB } = require('./connect');
const path = require('path')
const cookieParser = require('cookie-parser')
const { restrictToLoggedinUserOnly, checkAuth } = require('./middleware/auth')
const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter')
const userRoute = require('./routes/user')


const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
    console.log('Mongodb connected')
);



app.set("view engine", "ejs")
app.set("views", path.resolve('./views'))

app.get("/test", async (req, res) => {
    const allUrls = await URL.find({});
    return res.render("home", {
        urls: allUrls,
    })
})

// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());




app.use('/url', restrictToLoggedinUserOnly, urlRoute)
app.use('/user', checkAuth, userRoute)
app.use('/', staticRoute)

// Redirect route
app.get('/url/:shortId', async (req, res) => {
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
