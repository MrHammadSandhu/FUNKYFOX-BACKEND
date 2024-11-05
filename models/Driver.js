const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, unique: true },
    licenseNumber: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    dateOfBirth: { type: String },
    employmentStatus: { type: String, },
    hireDate: { type: String },
    image: {type: String},
    emergencyContact: {
        name: { type: String, },
        phone: { type: String, },
        relationship: { type: String, }
    },
 
    assignedVehicles: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    additionalNotes: { type: String }
});


const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);


module.exports = Driver;