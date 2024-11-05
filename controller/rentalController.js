const Rental = require("../models/Rental");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicles");
const { transport } = require("../middleware/nodemailer");

const rentVehicle = async (req, res) => {
    const { startDate, endDate, daysRented, totalCost, rentalRate, email, plateNumber } = req.body;

    try {
        const vehicle = await Vehicle.findOne({ plateNumber });
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // const start = new Date(startDate);
        // const end = new Date(endDate);
        // const daysRented = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        // const totalCost = daysRented * rentalRate;

        const rental = new Rental({
            vehicle: vehicle._id,
            driver: driver._id,
            startDate,
            endDate,
            daysRented,
            totalCost,
            rentalRate,
            totalCost
        });

        await rental.save();

        res.status(201).json({ message: 'Vehicle rented successfully', rental });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getRentalsForVehicle = async (req, res) => {
    const { vehicleId } = req.params;

    try {
        const rentals = await Rental.find({ vehicle: vehicleId }).populate('driver', 'username email');
        if (!rentals.length) {
            return res.status(404).json({ error: 'No rentals found for this vehicle' });
        }

        res.status(200).json({ rentals });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const singleRentalReport = async (req, res) => {
    const { id } = req.params

    try {
        const data = await Rental.findById(id).populate("vehicle", "name plateNumber").populate("driver", "username email")
        if (!data) {
            return res.status(404).json({ message: "No data found" })
        }
        return res.status(201).json({ success: false, data: data })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })

    }
}


const getAllActiveRentals = async (req, res) => {
    try {
        const rentalreports = await Rental.find().populate('driver', 'username email').populate('vehicle', 'plateNumber name')
        res.status(200).json({ success: true, data: rentalreports })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
};
const updateRental = async (req, res) => {
    const { id } = req.params;
    
    const body = req.body

    try {
        const rental = await Rental.findByIdAndUpdate(id, body, { new: true });

        if (!rental) {
            return res.status(404).json({ error: 'Rental not found' });
        }


        res.status(200).json({ message: 'Rental updated successfully', rental });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const deleteRental = async (req, res) => {
    const { id } = req.params

    try {
        const rental = await Rental.findByIdAndDelete(id);

        if (!rental) {
            return res.status(404).json({ error: 'Rental not found' });
        }

        res.status(200).json({ message: 'Rental deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getRentalsFromLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await Rental.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle').populate('driver');
};
const generateRentalReportPDF = (rentals) => {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'rentalReports.pdf');
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fontSize(25).text('Rental Reports', { align: 'center' });
    doc.moveDown();

    let totalRentalIncome = 0;
    rentals.forEach(rental => {
        totalRentalIncome += rental.totalCost;

        doc.fontSize(12).text(`Total Cost: ${rental.totalCost}`);
        doc.text(`Rental Rate: ${rental.rentalRate}`);
        doc.text(`Start Date: ${new Date(rental.startDate).toLocaleDateString()}`);
        doc.text(`End Date: ${new Date(rental.endDate).toLocaleDateString()}`);
        doc.text(`Driver: ${rental.driver.username} (${rental.driver.email})`);
        doc.text(`Vehicle: ${rental.vehicle.plateNumber} (${rental.vehicle.name})`);
        doc.moveDown();
    });

    // Add summary totals
    doc.addPage();
    doc.fontSize(25).text('Weekly Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Rental Income: $${totalRentalIncome.toFixed(2)}`);

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

const sendRentalReportEmail = (filePath) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mrwebxpert@gmail.com',
        subject: 'Weekly Rental Reports',
        text: 'Please find attached the rental reports for the last 7 days.',
        attachments: [
            {
                filename: 'rentalReports.pdf',
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
const sendWeeklyRentalReports = async () => {
    try {
        const rentals = await getRentalsFromLast7Days();
        const filePath = await generateRentalReportPDF(rentals); // Wait for PDF generation to complete
        sendRentalReportEmail(filePath);
    } catch (error) {
        console.error('Error generating or sending rental reports:', error);
    }
};

// Schedule the job to run every 7 days
const schedule = require('node-schedule');
// const job = schedule.scheduleJob('0 0 */7 * * *', function () {
//     sendWeeklyRentalReports();
// });

// For testing purposes (runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//     sendWeeklyRentalReports();
// });


module.exports = {
    rentVehicle,
    getRentalsForVehicle,
    getAllActiveRentals,
    updateRental,
    deleteRental,
    singleRentalReport
};
