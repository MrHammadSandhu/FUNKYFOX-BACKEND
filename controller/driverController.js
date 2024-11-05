
const Vehicle = require("../models/Vehicles");
const Driver = require("../models/Driver");
const File = require('../models/File');
const asyncHandler = require('express-async-handler');
const { transport } = require("../middleware/nodemailer");


const createDriver = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        licenseNumber,
        phoneNumber,
        address,
        dateOfBirth,
        employmentStatus,
        hireDate,
        emergencyContact,
        plateNumber,
        additionalNotes,
        image
    } = req.body;

    try {
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ success: false, message: "Driver with this email already exists" });
        }

        const vehicle = await Vehicle.findOne({ plateNumber });
        if (!vehicle) {
            return res.status(404).json({ message: "No vehicle found" });
        }

        const driver = new Driver({
            username,
            email,
            licenseNumber,
            phoneNumber,
            address,
            dateOfBirth,
            employmentStatus,
            hireDate,
            emergencyContact,
            assignedVehicles: vehicle._id,
            image,
            additionalNotes
        });
        await driver.save();

        const message = `Welcome ${username}!\n\nYour account has been successfully registered`;
        const mailOptions = {
            from: process.env.EMAIL_HOST,
            to: email,
            subject: "Account Registered Successfully",
            text: message
        };

        transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Error sending email", error: error.message });
            } else {
                console.log("Email sent: " + info.response);
                // Respond after email has been sent successfully
                return res.status(201).json({
                    message: "User registered successfully. Email sent.",
                    result: driver,
                    success: true
                });
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

const getAllDrivers = asyncHandler(async (req, res) => {
    try {
        const drivers = await Driver.find().populate('assignedVehicles', 'plateNumber name model lastServiceDate').select('-incomes -mileages');
        if (!drivers) {
            return res.status(404).json({ message: "No driver found" })
        }
        return res.status(200).json(drivers);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

const getDriverById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await Driver.findById(id).populate('assignedVehicles', "plateNumber name");
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.status(200).json(driver);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const updateDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const driver = await Driver.findByIdAndUpdate(id, body, { new: true });
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.status(200).json({ success: true, message: "Driver updated successfully", driver });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

const deleteDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await Driver.findByIdAndDelete(id);
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.status(200).json({ success: true, message: "Driver deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

const assignVehicleToDriver = asyncHandler(async (req, res) => {
    const { driverId, vehicleId } = req.params;

    try {
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        if (vehicle.assignedTo) {
            return res.status(400).json({ error: 'Vehicle is already assigned to another driver' });
        }

        driver.assignedVehicles.push(vehicle._id);
        await driver.save();

        vehicle.assignedTo = driver._id;
        await vehicle.save();

        res.status(200).json({ message: 'Vehicle assigned to driver', driver });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const unassignVehicleFromDriver = asyncHandler(async (req, res) => {
    const { driverId, vehicleId } = req.params;

    try {
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        if (vehicle.assignedTo.toString() !== driverId) {
            return res.status(400).json({ error: 'Vehicle is not assigned to this driver' });
        }

        driver.assignedVehicles.pull(vehicle._id);
        await driver.save();

        vehicle.assignedTo = null;
        await vehicle.save();

        res.status(200).json({ message: 'Vehicle unassigned from driver', driver });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    assignVehicleToDriver,
    unassignVehicleFromDriver
};