const mongoose = require("mongoose");

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Database is connected")
    }).catch(error => {
        console.log("Database is not connected", error.message)
    })
}
module.exports = connectDB