const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RentalSchema = new Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    startDate: { type: String },
    endDate: { type: String },
    daysRented: { type: Number },
    rentalRate: { type: Number },
    totalCost: { type: Number }
}, { timestamps: true });

const Rental = mongoose.model('Rental', RentalSchema);
module.exports = Rental;
