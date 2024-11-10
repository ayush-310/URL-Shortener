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
    redirectURL: {
        type: String,
        required: true,
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
