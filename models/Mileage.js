const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mileageSchema = new Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    kilometers: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Mileage = mongoose.model('Mileage', mileageSchema)
module.exports = Mileage