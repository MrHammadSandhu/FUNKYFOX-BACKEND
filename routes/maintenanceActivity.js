const express = require('express');
const { createMaintenanceActivity, getAllMaintenanceActivities, getMaintenanceActivityById, updateMaintenanceActivity, deleteMaintenanceActivity } = require('../controller/maintenanceActivity');
const maintenanceActivityRouter = express.Router();

maintenanceActivityRouter.post('/maintenanceactivity/register', createMaintenanceActivity);

maintenanceActivityRouter.get('/maintenanceactivity', getAllMaintenanceActivities);

maintenanceActivityRouter.get('/maintenanceactivity/:id', getMaintenanceActivityById);

maintenanceActivityRouter.put('/maintenanceactivity/:id', updateMaintenanceActivity);

maintenanceActivityRouter.delete('/maintenanceactivity/:id', deleteMaintenanceActivity);

module.exports = maintenanceActivityRouter;
