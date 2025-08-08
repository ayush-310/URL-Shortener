const mongoose =  require('mongoose')

async function connectToMongoDB(url) {
    return mongoose.connect(url)
}

module.exports = {
    connectToMongoDB,
}

// 6m4xbXAoXjQZsj5U