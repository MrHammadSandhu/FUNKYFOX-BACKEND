const MaintenanceLog = require("../models/MaintenanceLog");
const Vehicle = require("../models/Vehicles");

const addMaintenanceLog = async (req, res) => {
    try {
        const { plateNumber, date, description, partsReplaced, cost } = req.body;
        const vehicle = await Vehicle.findOne({ plateNumber: plateNumber });
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const maintenanceLog = new MaintenanceLog({
            vehicle: vehicle._id,
            date,
            description,
            partsReplaced,
            cost,
            plateNumber
        });

        await maintenanceLog.save();

        vehicle.maintenanceLogs.push(maintenanceLog._id);
        await vehicle.save();

        res.status(201).json(maintenanceLog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getMaintenanceLogsByVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicle = await Vehicle.findById(vehicleId).populate({
            path: 'maintenanceLogs',
            populate: { path: 'vehicle' }
        }).populate('driver');
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.status(200).json({
            maintenanceLogs: vehicle.maintenanceLogs,
            driver: vehicle.driver,
            vehicleDetails: {
                numberPlate: vehicle.numberPlate,
                modelName: vehicle.modelName
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateMaintenanceLog = async (req, res) => {
    try {
        const { logId } = req.params;
        const { date, description, partsReplaced, cost } = req.body;

        const maintenanceLog = await MaintenanceLog.findByIdAndUpdate(
            logId,
            { date, description, partsReplaced, cost },
            { new: true }
        );

        if (!maintenanceLog) {
            return res.status(404).json({ error: 'Maintenance log not found' });
        }

        res.status(200).json(maintenanceLog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteMaintenanceLog = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenanceLog = await MaintenanceLog.findByIdAndDelete(id);
        if (!maintenanceLog) {
            return res.status(404).json({ error: 'Maintenance log not found' });
        }

        // Remove log reference from vehicle
        const vehicle = await Vehicle.findById(maintenanceLog.vehicle);
        if (vehicle) {
            vehicle.maintenanceLogs.pull(maintenanceLog._id);
            await vehicle.save();
        }

        res.status(200).json({ message: 'Maintenance log deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllMaintenanceLogs = async (req, res) => {
    try {
        const maintenanceLogs = await MaintenanceLog.find().populate('vehicle');

        // const logsWithDetails = maintenanceLogs.map(log => ({
        //     logId: log._id,
        //     date: log.date,
        //     description: log.description,
        //     partsReplaced: log.partsReplaced,
        //     cost: log.cost,
        //     vehicle: {
        //         plateNumber: log.vehicle.plateNumber,
        //         name: log.vehicle.name
        //     },
        //     driver: {
        //         name: log.vehicle.driver?.username || 'No driver',
        //         email: log.vehicle.driver?.email || 'No email'
        //     }
        // }));

       return  res.status(200).json({data: maintenanceLogs});
    } catch (error) {
       return  res.status(400).json({ error: error.message });
    }
};
const getSingleMaintenanceLogs = async(req, res) =>{
    const {id} = req.params
    try {
        const data  = await MaintenanceLog.findById(id).populate("vehicle")
        if(!data) {
            return res.status(404).json({message: " No maintainance record found"})
        }
        
        return res.status(201).json({success: true, data: data})
    } catch (error) {
        return res.status(500).json({success: false, error: error.message})
        
    }
}

module.exports = {
    addMaintenanceLog,
    getMaintenanceLogsByVehicle,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    getAllMaintenanceLogs,
    getSingleMaintenanceLogs
};