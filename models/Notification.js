const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notificationSchema = new Schema({
    vehicleId: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification