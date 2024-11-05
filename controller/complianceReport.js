const ComplianceReport = require('../models/ComplianceReport');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicles');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { transport } = require('../middleware/nodemailer');

// Create Compliance Report
const createComplianceReport = async (req, res) => {
    try {
        const { plateNumber, email, inspectionDate, complianceStatus, issuesFound, resolutionDate, } = req.body;
        console.log("plateNumber", plateNumber, "email", email, "inspection", inspectionDate, "compliancestatus", complianceStatus, "issuesFound", issuesFound, "resolutionDate", resolutionDate,)

        const driver = await Driver.findOne({ email: email });
        const vehicle = await Vehicle.findOne({ plateNumber: plateNumber });

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const complianceReportData = {
            inspectionDate,
            complianceStatus,
            issuesFound,
            resolutionDate,
            driverId: driver._id,
            vehicleId: vehicle._id
        };

        const complianceReport = new ComplianceReport(complianceReportData);
        const savedReport = await complianceReport.save();

        res.status(201).json(savedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get All Compliance Reports
const getAllComplianceReports = async (req, res) => {
    try {
        const complianceReports = await ComplianceReport.find().populate('vehicleId', 'name model plateNumber').populate('driverId', 'username email');
        return res.status(201).json({ data: complianceReports });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get Compliance Report by ID
const getComplianceReportById = async (req, res) => {
    try {
        const complianceReport = await ComplianceReport.findById(req.params.id).populate("vehicleId", "plateNumber name").populate("driverId", "email username");
        if (!complianceReport) return res.status(404).json({ message: 'Compliance report not found' });
        res.json(complianceReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Compliance Report by ID
const updateComplianceReportById = async (req, res) => {
    try {
        const updatedReport = await ComplianceReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReport) return res.status(404).json({ message: 'Compliance report not found' });
        res.status(201).json(updatedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Compliance Report by ID
const deleteComplianceReportById = async (req, res) => {
    try {
        const deletedReport = await ComplianceReport.findByIdAndDelete(req.params.id);
        if (!deletedReport) return res.status(404).json({ message: 'Compliance report not found' });
        res.json({ message: 'Compliance report deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Reports from Last 7 Days
const getReportsFromLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await ComplianceReport.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicleId').populate('driverId');
};

// Generate PDF
const generatePDF = (reports) => {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'complianceReports.pdf');
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(23).text('Compliance Reports', { align: 'center' });
    doc.moveDown();

    reports.forEach(report => {
        doc.fontSize(12).text(`Driver Name: ${report?.driverId?.username || "Driver Name"}`);
        doc.text(`Driver Email: ${report?.driverId?.email || "Driver Email"}`);
        doc.text(`Vehicle: ${report.vehicleId.name} (${report.vehicleId.model})`);
        doc.text(`Plate Number: ${report.vehicleId.plateNumber}`);
        doc.text(`Inspection Date: ${report.inspectionDate ? new Date(report.inspectionDate).toLocaleDateString() : ''}`);
        doc.text(`Compliance Status: ${report.complianceStatus}`);
        doc.text(`Issues Found: ${report.issuesFound || 'None'}`);
        doc.text(`Resolution Date: ${report.resolutionDate ? new Date(report.resolutionDate).toLocaleDateString() : ''}`);
        // doc.text(Comments: ${report.comments || 'None'});
        doc.moveDown();
    });

    doc.end();
    return filePath;
};


// Send Email
const sendEmail = (filePath) => {

    const mailOptions = {
        from: process.env.EMAIL_HOST,
        to: 'mrwebxpert@gmail.com',
        subject: 'Weekly Compliance Reports',
        text: 'Please find attached the compliance reports for the last 7 days.',
        attachments: [
            {
                filename: 'complianceReports.pdf',
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

// Send Weekly Compliance Reports
const sendWeeklyComplianceReports = async () => {
    try {
        const reports = await getReportsFromLast7Days();
        const filePath = generatePDF(reports);
        sendEmail(filePath);
    } catch (error) {
        console.error('Error generating or sending compliance reports:', error);
    }
};

// Schedule the job to run every 7 days
const job = schedule.scheduleJob('0 0 */6 * *', function () {
    sendWeeklyComplianceReports();
});

// const job = schedule.scheduleJob('*/1 * * * *', function () {
//     sendWeeklyComplianceReports();
// });

module.exports = {
    createComplianceReport,
    getAllComplianceReports,
    getComplianceReportById,
    updateComplianceReportById,
    deleteComplianceReportById
};