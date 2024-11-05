const express = require('express');
const { addVehicle, getAllvehicles, addMileage, getMileage, scheduleMaintenance, updateTotalMileage, getNotifications, getVehiclesAssignedToUser, updateVehicles, singleVehicle, deleteVehicle } = require('../controller/vehicleController');
const vehicleRoute = express.Router();

vehicleRoute.post('/addvehicle', addVehicle)
vehicleRoute.get('/getAllVehicle', getAllvehicles)
vehicleRoute.post('/:vehicleId/addMileage', addMileage)
vehicleRoute.get('/addMileage', getMileage)
vehicleRoute.post('/:vehicleId/mainteance', scheduleMaintenance)
vehicleRoute.put('/:vehicleId/totalMileage', updateTotalMileage);
vehicleRoute.get('/notifications', getNotifications);
vehicleRoute.get('/assigned/:userId', getVehiclesAssignedToUser);
vehicleRoute.put('/updatevehicles/:id', updateVehicles)
vehicleRoute.get('/vehicle/:id', singleVehicle)
vehicleRoute.delete('/deletevehicles/:id', deleteVehicle)



module.exports = vehicleRoute 
