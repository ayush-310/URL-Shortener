const express = require("express");
require('dotenv').config();
const { connectToMongoDB } = require('./connect');
const path = require('path')
const cookieParser = require('cookie-parser')
const { restrictToLoggedinUserOnly, checkAuth } = require('./middleware/auth')
const URL = require('./models/url');
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter')
const userRoute = require('./routes/user')
const { createQRCode } = require('./controllers/url');


const app = express();
const PORT = 8001;

// const dbURL = process.env.DB_URL
connectToMongoDB("mongodb+srv://shorturl:6m4xbXAoXjQZsj5U@cluster0.d2byisk.mongodb.net/short-url").then(() =>
    console.log('Mongodb connected')
);



app.set("view engine", "ejs")
app.set("views", path.resolve('./views'))


const BASE_URL = process.env.BASE_URL;

app.get("/test", async (req, res) => {
    const allUrls = await URL.find({});
    const qrCodeImage = await createQRCode(shortID); // Ensure shortID is defined somewhere

    return res.render("home", { 
        title: "Dashboard", 
        alert: null, 
        id: null, 
        urls: allUrls, 
        qrCode: qrCodeImage,
        BASE_URL // pass it to EJS
    });
});



// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());




app.use('/url', restrictToLoggedinUserOnly, urlRoute)
app.use('/user', userRoute)
app.use('/', checkAuth, staticRoute)

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
