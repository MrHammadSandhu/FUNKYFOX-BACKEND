const express = require('express');
const { getRentalsForVehicle, rentVehicle, getAllActiveRentals, updateRental, deleteRental, singleRentalReport } = require('../controller/rentalController');
const rentalRoute = express.Router();

rentalRoute.post('/rentalreport/register', rentVehicle)
rentalRoute.get('/vehicles/:vehicleId/rentals', getRentalsForVehicle);
rentalRoute.get('/allrentalvehicles', getAllActiveRentals);
rentalRoute.get('/rentalReport/:id', singleRentalReport);

rentalRoute.put('/rental/:id', updateRental)
rentalRoute.delete('/rental/:id', deleteRental)

module.exports = rentalRoute