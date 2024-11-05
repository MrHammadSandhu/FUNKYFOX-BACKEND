const mongoose = require('mongoose');
const Schema = mongoose.Schema

const maintenanceLogSchema = new Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    partsReplaced: { type: String },
    cost: { type: String },
    plateNumber: { type: String }
}, { timestamps: true });

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);

module.exports = MaintenanceLog;