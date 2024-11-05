const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TrafficFineSchema = new Schema({
    amount: {
        type: String,

    },
    date: {
        type: String,

    },
    description: {
        type: String,

    },
    location: {
        type: String
    },

    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', }

}, { timestamps: true })

const TrafficFine = mongoose.model("TrafficFine", TrafficFineSchema)
module.exports = TrafficFine