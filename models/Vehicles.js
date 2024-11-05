const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VehicleSchema = new Schema({
    name: {
        type: String,
        
    },
    model: {
        type: String,
        
    },
    plateNumber: {
        type: String,
        unique: true
    },
    lastServiceDate: {
        type: String,
    },

    totalMileage: {
        type: String,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver"
    },
    mileages: [{
        kilometers: { type: Number,  },
        date: { type: Date, default: Date.now }
    }],
    maintenanceLogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceLog'
    }],
    trafficFines: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TrafficFine"
        }
    ],
    accidents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accident'
    }],
    incomes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Income'
    }]
})

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
module.exports = Vehicle
