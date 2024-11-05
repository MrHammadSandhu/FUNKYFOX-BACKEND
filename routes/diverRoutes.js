const express = require('express');
const { getAllDrivers, assignVehicleToDriver, createDriver, deleteDriver, updateDriver, getDriverById, unassignVehicleFromDriver } = require('../controller/driverController');
const driverRouter = express.Router();
const multer = require('multer')
const {storage} = multer.memoryStorage()
const upload = multer({storage})

driverRouter.post('/createdrivers', upload.single("image"),  createDriver)
driverRouter.get('/getalldrivers', getAllDrivers)
driverRouter.get('/getsingaldriver/:id', getDriverById)
driverRouter.patch('/updatedrivers/:id', updateDriver)
driverRouter.delete('/deletedrivers/:id', deleteDriver)
driverRouter.post('/drivers/:driverId/vehicles/:vehicleId', assignVehicleToDriver);
driverRouter.delete('/drivers/:driverId/vehicles/:vehicleId', unassignVehicleFromDriver);

module.exports = driverRouter