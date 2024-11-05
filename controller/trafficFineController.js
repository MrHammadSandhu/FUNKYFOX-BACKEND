const TrafficFine = require("../models/TrafficFines");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicles");
const schedule = require('node-schedule');

const addTrafficFine = async (req, res) => {
    const { amount, date, description, email, plateNumber, location } = req.body;
    console.log("here is numberPlate from form", plateNumber)

    try {
        const vehicle = await Vehicle.findOne({ plateNumber: plateNumber });
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        const trafficFine = new TrafficFine({
            amount,
            date,
            description,
            location,
            vehicle: vehicle._id,
            driver: driver._id
        });

        await trafficFine.save();

        vehicle.trafficFines.push(trafficFine._id);
        await vehicle.save();

        return res.status(201).json({ message: 'Traffic fine added', trafficFine });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
const singleTrafficFineReport = async (req, res) => {
    const { id } = req.params
    try {
        const data = await TrafficFine.findById(id).populate('vehicle').populate('driver')
        if (!data) {
            return res.status(404).json({ message: "No fines found" })

        }
        return res.status(201).json({ success: true, data: data })

    } catch (error) {
        return res.status(500).json({ message: "An error occur while getting traffic fine report" })

    }
}

const getTrafficFinesForVehicle = async (req, res) => {
    const { vehicleId } = req.params;
    try {
        const trafficFines = await TrafficFine.find({ vehicle: vehicleId })
            .populate("driver", "username email")
            .populate("vehicle", "numberPlate model");

        if (!trafficFines.length) {
            return res.status(404).json({ error: 'No traffic fines found for this vehicle' });
        }

        res.status(200).json({ success: true, trafficFines });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllTrafficFines = async (req, res) => {
    try {
        const trafficFines = await TrafficFine.find()
            .populate("driver", "username email")
            .populate("vehicle", "plateNumber model");

        if (!trafficFines.length) {
            return res.status(404).json({ error: 'No traffic fines found' });
        }

        res.status(200).json({ success: true, trafficFines });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateTrafficFine = async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    console.log("Received update request for ID:", id); // Log the received ID

    try {
        const trafficFine = await TrafficFine.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!trafficFine) {
            return res.status(404).json({ error: 'Traffic fine not found' });
        }

        res.status(200).json({ message: 'Traffic fine updated', trafficFine });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const deleteTrafficFine = async (req, res) => {
    const { id } = req.params;
    console.log("Received request params:", req.params);
    console.log("Here is fineId:", id);
    try {
        const trafficFine = await TrafficFine.findByIdAndDelete(id);

        if (!trafficFine) {
            return res.status(404).json({ error: 'Traffic fine not found' });
        }

        await Vehicle.updateOne(
            { _id: trafficFine.vehicle },
            { $pull: { trafficFines: trafficFine._id } }
        );

        res.status(200).json({ message: 'Traffic fine deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getTrafficFinesFromLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await TrafficFine.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle').populate('driver');
};


const generateTrafficFinePDF = (reports) => {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'trafficFineReports.pdf');
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fontSize(25).text('Traffic Fine Reports', { align: 'center' });
    doc.moveDown();

    // Initialize totals for the summary
    let totalAmount = 0;

    reports.forEach(report => {
        console.log("Adding report to PDF:", report); // Debug log

        totalAmount += parseFloat(report.amount);

        doc.fontSize(12).text(`Amount: ${report.amount}`);
        doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`);
        doc.text(`Description: ${report.description}`);
        doc.text(`Driver: ${report.driver.username} (${report.driver.email})`);
        doc.text(`Vehicle Plate Number: ${report.vehicle.plateNumber}`);
        doc.text(`Vehicle Model: ${report.vehicle.model}`);
        doc.moveDown();
    });

    // Add summary totals
    doc.addPage();
    doc.fontSize(25).text('Weekly Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Traffic Fines: ${totalAmount.toFixed(2)}`);

    doc.end();

    // Return a promise that resolves when the PDF is fully written
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            resolve(filePath);
        });
        writeStream.on('error', (err) => {
            reject(err);
        });
    });
};


const sendTrafficFineEmail = (filePath) => {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mrwebxpert@gmail.com',
        subject: 'Weekly Traffic Fine Reports',
        text: 'Please find attached the traffic fine reports for the last 7 days.',
        attachments: [
            {
                filename: 'trafficFineReports.pdf',
                path: filePath
            }
        ]
    };

    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


const sendWeeklyTrafficFineReports = async () => {
    try {
        const reports = await getTrafficFinesFromLast7Days();
        const filePath = await generateTrafficFinePDF(reports); // Wait for PDF generation to complete
        sendTrafficFineEmail(filePath);
    } catch (error) {
        console.error('Error generating or sending traffic fine reports:', error);
    }
};

// Schedule the job to run every 7 days

const { transport } = require("../middleware/nodemailer");
// const job = schedule.scheduleJob('0 0 */7 * * *', function () {
//     sendWeeklyTrafficFineReports();
// });

// For testing purposes (runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//     sendWeeklyTrafficFineReports();
// });








module.exports = {
    addTrafficFine,
    getTrafficFinesForVehicle,
    getAllTrafficFines,
    updateTrafficFine,
    deleteTrafficFine,
    singleTrafficFineReport
};