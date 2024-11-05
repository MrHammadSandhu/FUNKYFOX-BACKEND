const express = require('express');
const { addMaintenanceLog, getMaintenanceLogsByVehicle, updateMaintenanceLog, deleteMaintenanceLog, getAllMaintenanceLogs, getSingleMaintenanceLogs } = require('../controller/maintenanceController');
const mainteanceRoute = express.Router();


mainteanceRoute.post('/addMaintenanceLog', addMaintenanceLog)
mainteanceRoute.get('/getMaintenanceLogsByVehicle/:id', getMaintenanceLogsByVehicle)
mainteanceRoute.patch('/updateMaintenanceLog/:logId', updateMaintenanceLog)
mainteanceRoute.delete('/deleteMaintenanceLog/:id', deleteMaintenanceLog)
mainteanceRoute.get('/getAllMaintenanceLogs', getAllMaintenanceLogs)
mainteanceRoute.get('/getsinglemaintainancereport/:id', getSingleMaintenanceLogs)

module.exports = mainteanceRoute