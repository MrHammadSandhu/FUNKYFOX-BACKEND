const Accident = require('../models/Accident');
const Driver = require("../models/Driver")
const Vehicle = require("../models/Vehicles")
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { transport } = require("../middleware/nodemailer");

const addAccident = async (req, res) => {
    const { date, location, description, damages, injuries, plateNumber, email, expense } = req.body;
    console.log("Received data:", req.body);

    try {
        const vehicle = await Vehicle.findOne({ plateNumber: plateNumber });
        console.log(vehicle)
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const driver = await Driver.findOne({ email: email });
        console.log(driver)
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        const accident = new Accident({
            date,
            location,
            description,
            vehicle: vehicle._id,
            driver: driver._id,
            damages,
            injuries,
            expense
        });

        await accident.save();

        vehicle.accidents.push(accident._id);
        await vehicle.save();
        const message = `
                    Dear ${driver.username},

                    We regret to inform you about an incident involving your vehicle. Below are the details:

                    Date: ${date} \n
                    Location: ${location}\n
                    Description: ${description}\n
                    Damages: ${damages}\n
                    Injuries: ${injuries}\n
                    Expense: ${expense}\n
                    Vehicle: ${vehicle.name}\n
                    Vehicle Model: ${vehicle.model}\n
                    Plate Number: ${vehicle.plateNumber}\n

                    Please contact us for further assistance.\n

                    Sincerely,
                   FUNKY-FOX
                `;
        ;
        const mailOptions = {
            from: process.env.EMAIL_HOST,
            to: email,
            subject: "Account Report",
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
                    message: "Accident report send successfully. Email sent.",
                    result: accident,
                    success: true
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ error: error.message });
    }
};
const getSingleAccident = async (req, res) => {
    const { id } = req.params
    try {
        const data = await Accident.findById(id).populate("vehicle").populate('driver')
        if (!data) {
            return res.status(404).json({ message: "No data found" })

        }
        return res.status(201).json({ success: true, data: data })

    } catch (error) {
        return res.status(500).json({ message: "an error occur while getting single user", error: error.message })
    }
}


const getAccidentsForVehicle = async (req, res) => {
    const { vehicleId } = req.params;

    try {
        const accidents = await Accident.find({ vehicle: vehicleId }).populate('driver', 'username email');
        if (!accidents.length) {
            return res.status(404).json({ error: 'No accidents found for this vehicle' });
        }

        res.status(200).json({ accidents });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllAccidents = async (req, res) => {
    try {
        const accidents = await Accident.find().populate('vehicle').populate('driver');

        if (!accidents.length) {
            return res.status(404).json({ error: 'No accidents found' });
        }

        // const response = accidents.map(accident => ({
        //     accidentId: accident._id,
        //     date: accident.date,
        //     description: accident.description,
        //     location: accident.location,
        //     damages: accident.damages,
        //     injuries: accident.injuries,
        //     vehicle: {
        //         id: accident.vehicle._id,
        //         name: accident.vehicle.name,
        //         model: accident.vehicle.model,
        //         plateNumber: accident.vehicle.plateNumber
        //     },
        //     driver: {
        //         id: accident.driver._id,
        //         username: accident.driver.username,
        //         email: accident.driver.email
        //     }
        // }));

        res.status(200).json({ accidents });
    } catch (error) {
        res.status(400).json({ error: error.message, message: "failed to fetch data" });
    }
};
const deleteAccident = async (req, res) => {
    const { accidentId } = req.params;

    try {
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ error: 'Accident not found' });
        }

        // Remove accident reference from the vehicle's accident array
        await Vehicle.findByIdAndUpdate(accident.vehicle, {
            $pull: { accidents: accidentId }
        });

        await accident.deleteOne();

        res.status(200).json({ message: 'Accident deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const updateAccident = async (req, res) => {
    const { accidentId } = req.params;
    const { date, description } = req.body;

    try {
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ error: 'Accident not found' });
        }

        if (date) {
            accident.date = date;
        }
        if (description) {
            accident.description = description;
        }

        await accident.save();

        res.status(200).json({ message: 'Accident updated successfully', accident });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// const getAccidentReportsFromLast7Days = async () => {
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     return await Accident.find({
//         createdAt: { $gte: sevenDaysAgo }
//     }).populate('vehicle').populate('driver');
// };
// const generateAccidentPDF = (reports) => {
//     const PDFDocument = require('pdfkit');
//     const fs = require('fs');
//     const path = require('path');

//     const doc = new PDFDocument();
//     const filePath = path.join(__dirname, 'accidentReports.pdf');
//     doc.pipe(fs.createWriteStream(filePath));

//     doc.fontSize(25).text('Accident Reports', { align: 'center' });
//     doc.moveDown();

//     // Initialize totals
//     let totalExpense = 0;
//     let totalInjuries = 0;
//     let totalDamages = 0;
//     let totalAccidents = reports.length;

//     // Add individual reports and calculate totals
//     reports.forEach(report => {
//         totalExpense += parseFloat(report.expense);
//         totalInjuries += parseInt(report.injuries);
//         totalDamages += parseInt(report.damages);

//         doc.fontSize(12).text(`Date: ${report.date}`);
//         doc.text(`Location: ${report.location}`);
//         doc.text(`Description: ${report.description}`);
//         doc.text(`Damages: ${report.damages}`);
//         doc.text(`Injuries: ${report.injuries}`);
//         doc.text(`Expense: ${report.expense}`);
//         doc.text(`Vehicle Plate Number: ${report.vehicle.plateNumber}`);
//         doc.text(`Vehicle Model: ${report.vehicle.model}`);
//         doc.text(`Driver Name: ${report.driver.username}`);
//         doc.text(`Driver Email: ${report.driver.email}`);
//         doc.text(`Report Date: ${new Date(report.createdAt).toLocaleDateString()}`);
//         doc.moveDown();
//     });

//     // Add summary totals
//     doc.addPage();
//     doc.fontSize(25).text('Weekly Summary', { align: 'center' });
//     doc.moveDown();
//     doc.fontSize(12).text(`Total Accidents: ${totalAccidents}`);
//     doc.text(`Total Expense: ${totalExpense.toFixed(2)}`);

//     doc.end();
//     return filePath;
// };

// const sendAccidentEmail = (filePath) => {

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: 'mrwebxpert@gmail.com',
//         subject: 'Weekly Accident Reports',
//         text: 'Please find attached the accident reports for the last 7 days.',
//         attachments: [
//             {
//                 filename: 'accidentReports.pdf',
//                 path: filePath
//             }
//         ]
//     };

//     transport.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response);
//         }
//     });
// };


// const sendWeeklyAccidentReports = async () => {
//     try {
//         const reports = await getAccidentReportsFromLast7Days();
//         const filePath = generateAccidentPDF(reports);
//         sendAccidentEmail(filePath);
//     } catch (error) {
//         console.error('Error generating or sending accident reports:', error);
//     }
// };

// // Schedule the job to run every 7 days
// // const job = schedule.scheduleJob('0 0 */7 * * *', function () {
// //     sendWeeklyAccidentReports();
// // });

// // For testing purposes (runs every minute):
// // const job = schedule.scheduleJob('*/1 * * * *', function () {
// //     sendWeeklyAccidentReports();
// // });


// const job = schedule.scheduleJob('0 0 */7 * * *', function () {
//     sendWeeklyAccidentReports();
// });

// const schedule = require('node-schedule');
// const { transport } = require('../middleware/nodemailer');
// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');
// const Accident = require('../models/Accident');
const ComplianceReport = require('../models/ComplianceReport');
const Expense = require('../models/Expense');
const FinancialReport = require('../models/FinancialReport');
const Income = require('../models/Income');
const OperationalReport = require('../models/OperationalReport');
const TrafficFine = require('../models/TrafficFines');


const getReportsFromLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const accidentReports = await Accident.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle').populate('driver');

    const complianceReports = await ComplianceReport.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicleId').populate('driverId');

    const expenseReports = await Expense.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle');

    const financialReports = await FinancialReport.find({
        createdAt: { $gte: sevenDaysAgo }
    });

    const incomeReports = await Income.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle').populate('driver');

    const operationalReports = await OperationalReport.find({
        reportDate: { $gte: sevenDaysAgo }
    });

    const trafficFineReports = await TrafficFine.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle').populate('driver');

    // Calculate the weekly profit and loss summary
    const totalIncome = incomeReports.reduce((sum, report) => sum + report.amount, 0);
    const totalExpenses = expenseReports.reduce((sum, report) => sum + report.amount, 0);
    const profitability = totalIncome - totalExpenses;

    return {
        accidentReports,
        complianceReports,
        expenseReports,
        financialReports,
        incomeReports,
        operationalReports,
        trafficFineReports,
        summary: {
            totalIncome,
            totalExpenses,
            profitability
        }
    };
};



const generateCombinedPDF = (allReports) => {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'weeklyReport.pdf');
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(25).text('Weekly Reports', { align: 'center' });
    doc.moveDown();

    // Add Weekly Summary
    doc.fontSize(20).text('Weekly Summary', { align: 'left' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Income: ${allReports.summary.totalIncome}`);
    doc.text(`Total Expenses: ${allReports.summary.totalExpenses}`);
    doc.text(`Profitability: ${allReports.summary.profitability}`);
    doc.moveDown();

    // Add Accident Reports
    doc.fontSize(20).text('Accident Reports', { align: 'left' });
    doc.moveDown();

    allReports.accidentReports.forEach(report => {
        doc.fontSize(12).text(`Date: ${report.date}`);
        doc.text(`Location: ${report.location}`);
        doc.text(`Description: ${report.description}`);
        doc.text(`Damages: ${report.damages}`);
        doc.text(`Injuries: ${report.injuries}`);
        doc.text(`Expense: ${report.expense}`);
        doc.text(`Vehicle Plate Number: ${report.vehicle.plateNumber}`);
        doc.text(`Vehicle Model: ${report.vehicle.model}`);
        doc.text(`Driver Name: ${report.driver.username}`);
        doc.text(`Driver Email: ${report.driver.email}`);
        doc.text(`Report Date: ${new Date(report.createdAt).toLocaleDateString()}`);
        doc.moveDown();
    });

    // Add Compliance Reports
    doc.fontSize(20).text('Compliance Reports', { align: 'left' });
    doc.moveDown();

    allReports.complianceReports.forEach(report => {
        doc.fontSize(12).text(`Driver Name: ${report?.driverId?.username || "Driver Name"}`);
        doc.text(`Driver Email: ${report?.driverId?.email || "Driver Email"}`);
        doc.text(`Vehicle: ${report.vehicleId.name} (${report.vehicleId.model})`);
        doc.text(`Plate Number: ${report.vehicleId.plateNumber}`);
        doc.text(`Inspection Date: ${report.inspectionDate ? new Date(report.inspectionDate).toLocaleDateString() : ''}`);
        doc.text(`Compliance Status: ${report.complianceStatus}`);
        doc.text(`Issues Found: ${report.issuesFound || 'None'}`);
        doc.text(`Resolution Date: ${report.resolutionDate ? new Date(report.resolutionDate).toLocaleDateString() : ''}`);
        doc.moveDown();
    });

    // Add Expense Reports
    doc.fontSize(20).text('Expense Reports', { align: 'left' });
    doc.moveDown();

    allReports.expenseReports.forEach(report => {
        doc.fontSize(12).text(`Amount: ${report.amount}`);
        doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`);
        doc.text(`Category: ${report.category}`);
        doc.text(`Description: ${report.description}`);
        doc.text(`Receipt Number: ${report.receiptNumber}`);
        doc.text(`Payment Method: ${report.paymentMethod}`);
        doc.text(`Vehicle Plate Number: ${report.vehicle.plateNumber}`);
        doc.text(`Vehicle Model: ${report.vehicle.model}`);
        doc.moveDown();
    });

    // Add Financial Reports
    doc.fontSize(20).text('Financial Reports', { align: 'left' });
    doc.moveDown();

    allReports.financialReports.forEach(report => {
        doc.fontSize(12).text(`Income: ${report.income}`);
        doc.text(`Expenses: ${report.expenses}`);
        doc.text(`Profitability: ${report.profitability}`);
        doc.text(`Gross Profit: ${report.grossProfit}`);
        doc.text(`Operating Expenses: ${report.operatingExpenses}`);
        doc.text(`Taxes: ${report.taxes}`);
        doc.text(`Comments: ${report.comments}`);
        doc.text(`Report Date: ${new Date(report.reportDate).toLocaleDateString()}`);
        doc.moveDown();
    });

    // Add Income Reports
    doc.fontSize(20).text('Income Reports', { align: 'left' });
    doc.moveDown();

    allReports.incomeReports.forEach(income => {
        doc.fontSize(12).text(`Amount: ${income.amount}`);
        doc.text(`Source: ${income.source}`);
        doc.text(`Date: ${new Date(income.date).toLocaleDateString()}`);
        doc.text(`Driver: ${income.driver.username} (${income.driver.email})`);
        doc.text(`Vehicle: ${income.vehicle.plateNumber} (${income.vehicle.model})`);
        doc.moveDown();
    });

    // Add Operational Reports
    doc.fontSize(20).text('Operational Reports', { align: 'left' });
    doc.moveDown();

    allReports.operationalReports.forEach(report => {
        doc.fontSize(12).text(`Fleet Utilization: ${report.fleetUtilization}%`);
        doc.text(`Driver Performance: ${report.driverPerformance}/10`);
        doc.text(`Trip Efficiency: ${report.tripEfficiency}%`);
        doc.text(`Report Date: ${new Date(report.reportDate).toLocaleDateString()}`);
        doc.text(`Created By: ${report.createdBy}`);
        doc.text(`Comments: ${report.comments}`);
        doc.moveDown();
    });

    // Add Traffic Fine Reports
    doc.fontSize(20).text('Traffic Fine Reports', { align: 'left' });
    doc.moveDown();

    allReports.trafficFineReports.forEach(report => {
        doc.fontSize(12).text(`Amount: ${report.amount}`);
        doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`);
        doc.text(`Description: ${report.description}`);
        doc.text(`Driver: ${report.driver.username} (${report.driver.email})`);
        doc.text(`Vehicle Plate Number: ${report.vehicle.plateNumber}`);
        doc.text(`Vehicle Model: ${report.vehicle.model}`);
        doc.moveDown();
    });

    doc.end();
    return filePath;
};



const sendWeeklyReportEmail = (filePath) => {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mrwebxpert@gmail.com',
        subject: 'Weekly Combined Report',
        text: 'Please find attached the combined reports for the last 7 days.',
        attachments: [
            {
                filename: 'weeklyReport.pdf',
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


const sendWeeklyCombinedReports = async () => {
    try {
        const allReports = await getReportsFromLast7Days();
        const filePath = generateCombinedPDF(allReports);
        sendWeeklyReportEmail(filePath);
    } catch (error) {
        console.error('Error generating or sending combined reports:', error);
    }
};

// Schedule the job to run every 7 days

const job = schedule.scheduleJob('0 0 */7 * * *', function () {
    sendWeeklyCombinedReports();
});

// const job = schedule.scheduleJob('*/1 * * * *', function () {
//     sendWeeklyCombinedReports();
// });


module.exports = {
    addAccident,
    getAccidentsForVehicle,
    getAllAccidents,
    deleteAccident,
    updateAccident,
    getSingleAccident
};