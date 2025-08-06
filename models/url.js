const mongoose = require('mongoose');

// Function to generate a random short ID
const generateShortID = () => {
    return Math.random().toString(36).substring(2, 8); // Generates a random string of 6 characters
};

// Define the URL schema
const urlSchema = new mongoose.Schema({
    shortID: {
        type: String,
        required: true,
        unique: true,
    },
    QR:{
        type: String,
        required: false,
        // Default QR code image URL, can be replaced with a generated QR code later
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/800px-QR_code_for_mobile_English_Wikipedia.svg.png"
    },
    redirectURL: {
        type: String,
        required: true,
        unique: true,
    },
    visitHistory: [{ timestamp: { type: Number } }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }
},
    { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Pre-validation hook to generate shortID if not provided
urlSchema.pre('validate', function (next) {
    if (!this.shortID) {
        this.shortID = generateShortID();
    }
    next();
});

// Create the URL model based on the schema
const URL = mongoose.model('URL', urlSchema); // Model name is conventionally uppercase

module.exports = URL;
