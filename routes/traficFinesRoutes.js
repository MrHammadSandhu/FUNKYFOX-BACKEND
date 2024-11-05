const express = require('express');
const { addTrafficFine, getTrafficFinesForVehicle, getAllTrafficFines, updateTrafficFine, deleteTrafficFine, singleTrafficFineReport } = require('../controller/trafficFineController');
const trafficFineRoute = express.Router();

trafficFineRoute.post('/trafficfines', addTrafficFine);
trafficFineRoute.get('/vehicles/:id/trafficFines', getTrafficFinesForVehicle);
trafficFineRoute.get('/trafficfines/:id', singleTrafficFineReport);

trafficFineRoute.get('/getAllTrafficFines', getAllTrafficFines);
trafficFineRoute.patch('/trafficfineupdate/:id', updateTrafficFine);
trafficFineRoute.delete('/trafficfine/:id', deleteTrafficFine);



module.exports = trafficFineRoute