const { transport } = require("../middleware/nodemailer");
const Mileage = require("../models/Mileage");
const Notification = require("../models/Notification");
const Vehicle = require("../models/Vehicles");
const nodemailer = require('nodemailer')




const addVehicle = async (req, res) => {
    const { name, model, plateNumber, totalMileage, income, lastServiceDate } = req.body

    try {
        const existCar = await Vehicle.findOne({ plateNumber });
        if (existCar) {
            return res.status(404).json({ message: 'Vehicle Already Exist' });
        }

        const vehicle = new Vehicle({
            name: name,
            model: model,
            plateNumber: plateNumber,
            totalMileage,
            income,
            lastServiceDate: lastServiceDate
        });
        await vehicle.save();
        res.status(201).json({ success: true, message: "vehicle added successfully", vehicle })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}

const getAllvehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().populate('assignedTo', 'username email')
        res.status(200).json({ success: true, vehicles })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}
const updateVehicles = async (req, res) =>{
    const {id} = req.params
    const body = req.body
    try {
        const data = await Vehicle.findByIdAndUpdate(id, body,{ new: true})
        if(!data) {
            return res.status(404).json({message: "no vehicle found`"})
        }
        return res.status(201).json({success: true, message: "Vehicle Updated successfully"})
        
    } catch (error) {
        return res.status(500).json({message: "Error occur while updating", error: error.message})
        
    }
}
const deleteVehicle = async (req, res) =>{
    const {id} = req.params
    try {
        const data = await Vehicle.findByIdAndDelete(id)
        if(!data) {
            return res.status(404).json({message: "no vehicle found`"})
        }
        return res.status(201).json({success: true, message: "Vehicle deleted successfully"})
        
    } catch (error) {
        return res.status(500).json({message: "Error occur while deleting data", error: error.message})
        
    }
}
const singleVehicle = async (req, res) =>{
    const {id } = req.params;

    try {
        const data = await Vehicle.findById(id)
        if(!data){
            return res.status(404).json({message: "No vehicle found"})
        }
        return res.status(201).json({success: true, data: data})
    } catch (error) {
        return res.status(500).json({message: "error occur getting the vehicle detail", error: error.message})
        
    }
}
const addMileage = async (req, res) => {
    const { kilometers, plateNumber } = req.body;

    try {
        const vehicle = await Vehicle.findOne({ plateNumber });
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        // Calculate new total mileage
        const newTotalMileage = vehicle.totalMileage + kilometers;

        // Create a new mileage entry
        const newMileage = new Mileage({
            vehicle: vehicle._id,
            kilometers: kilometers
        });

        // Push new mileage to vehicle's mileage array
        vehicle.mileages.push(newMileage);
        vehicle.totalMileage = newTotalMileage;

        // Check if totalMileage exceeds 700 km
        if (vehicle.totalMileage % 700 === 0) {
            const milestone = vehicle.totalMileage;
            const notificationMessage =` Vehicle ${vehicle.name} (${vehicle.model}) with plate number ${vehicle.plateNumber} has crossed ${milestone} km and requires maintenance.`;
            const notification = new Notification({
                vehicleId: vehicle._id,
                message: notificationMessage,
                date: new Date(),
                read: false
            });
            await notification.save();

            const mailOptions = {
                from: process.env.EMAIL_HOST,
                to: "mrwebxpert@gmail.com",
                subject: "Vehicle Maintenance Required",
                text: notificationMessage
            };

            transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error.message);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }

        // Save updated vehicle data
        await vehicle.save();

        res.status(200).json({ success: true, vehicle });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getMileage = async (req, res) => {
    const { vehicleId } = req.params
    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json(vehicle.mileages);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}

const updateTotalMileage = async (req, res) => {
    const { vehicleId } = req.params;
    const { kilometers } = req.body;

    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        vehicle.totalMileage += kilometers;
        await vehicle.save();

        res.status(200).json({ success: true, vehicle });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getVehiclesAssignedToUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const vehicles = await Vehicle.find({ assignedTo: userId }).populate('assignedTo', 'name email');
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const scheduleMaintenance = async (req, res) => {
    const { vehicleId } = req.params;
    const { email } = req.body;

    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        if (vehicle.totalMileage > 700) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_HOST,
                    pass: process.env.PASS_KEY
                }
            });

            const message = `Vehicle ${vehicle.name} (${vehicle.model}) NumberPlate: (${vehicle.plateNumber}) has exceeded 700 km and is due for maintenance.`;

            const mailOptions = {
                from: process.env.EMAIL_HOST,
                to: email,
                subject: "Vehicle Maintenance Scheduled",
                text: message
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ error: error.message }); // Send error response here
                }
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'Maintenance scheduled and email sent.', vehicle }); // Send success response here
            });
        } else {
            res.status(200).json({ message: 'Vehicle does not require maintenance yet.', vehicle });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ read: false }).populate('vehicleId');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


module.exports = {
    addVehicle,
    getAllvehicles,
    addMileage,
    getMileage,
    updateTotalMileage,
    scheduleMaintenance,
    getVehiclesAssignedToUser,
    getNotifications,
    singleVehicle,
    deleteVehicle,
    updateVehicles
}