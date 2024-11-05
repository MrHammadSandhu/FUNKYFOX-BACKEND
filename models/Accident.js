const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccidentSchema = new Schema({
    date: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    damages: { type: String, required: true },
    injuries: { type: String, required: true },
    expense: { type: String },

}, { timestamps: true });

const Accident = mongoose.model('Accident', AccidentSchema);
module.exports = Accident;