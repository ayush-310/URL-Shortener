const mongoose = require('mongoose');

// Function to generate a random short ID
const generateShortID = () => {
    return Math.random().toString(36).substring(2, 8); // Random 6-character string
};

// Define the URL schema
const urlSchema = new mongoose.Schema({
    shortID: {
        type: String,
        required: true,
        unique: true, // Short ID should be unique globally
    },
    QR: {
        type: String,
        required: false,
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/800px-QR_code_for_mobile_English_Wikipedia.svg.png"
    },
    redirectURL: {
        type: String,
        required: true,
        // ❌ no global unique constraint
    },
    visitHistory: [{ timestamp: { type: Number } }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    }
});

// ✅ Compound unique index to prevent duplicate redirectURL for the same user
urlSchema.index({ redirectURL: 1, createdBy: 1 }, { unique: true });

// Pre-validation hook to generate shortID if not provided
urlSchema.pre('validate', function (next) {
    if (!this.shortID) {
        this.shortID = generateShortID();
    }
    next();
});

// Create the URL model based on the schema
const URL = mongoose.model('URL', urlSchema);

module.exports = URL;
