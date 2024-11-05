const express = require('express');
const { addAccident, getAccidentsForVehicle, getAllAccidents, deleteAccident, updateAccident, getSingleAccident } = require('../controller/accidentController');
const accidentRoute = express.Router();


accidentRoute.post('/accidents', addAccident);

accidentRoute.get('/vehicles/:vehicleId/accidents', getAccidentsForVehicle);
accidentRoute.get('/allaccidents', getAllAccidents)
accidentRoute.get('/accident/:id', getSingleAccident)
accidentRoute.delete('/accidents/:accidentId', deleteAccident);
accidentRoute.put('/accidents/:accidentId', updateAccident);

module.exports = accidentRoute