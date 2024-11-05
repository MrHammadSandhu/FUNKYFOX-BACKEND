const Admin = require("../models/Admin");
const ProfitLossReport = require("../models/ProfitLossReport");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { transport } = require("../middleware/nodemailer")



exports.createProfitLoss = async (req, res) => {
    try {
        const reports = new ProfitLossReport(req.body);
        const report = await reports.save();


        // const admin = await Admin.findOne();
        // if (admin) {
        //     admin.profitLossReports.push(report._id);
        //     await admin.save();
        // } else {
        //     await new Admin({ reports: [report._id] }).save();
        // }

        return res.status(201).json({ success: true, data: report })
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.getAllProfitLossReport = async (req, res) => {
    try {
        const reports = await ProfitLossReport.find();
        res.status(200).send(reports);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getProfitLossReport = async (req, res) => {
    try {
        const report = await ProfitLossReport.findById(req.params.id);
        if (!report) return res.status(404).send();
        res.status(200).send(report);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateProfitLossReport = async (req, res) => {
    try {
        const report = await ProfitLossReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!report) return res.status(404).send();
        res.status(200).send(report);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.deleteProfitLossReport = async (req, res) => {
    const { id } = req.params
    try {
        const report = await ProfitLossReport.findByIdAndDelete(id);
        if (!report) return res.status(404).send();
        res.status(200).send(report);
    } catch (error) {
        res.status(500).send(error);
    }
};
exports.getSingleProfitLossReport = async (req, res) => {
    const { id } = req.params

    try {
        const data = await ProfitLossReport.findById(id)
        if (!data) {
            return res.status(404).json({ message: "No data found" })
        }
        return res.status(201).json({ success: true, data: data })

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })

    }
}

const getProfitLossReportsFromLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return await ProfitLossReport.find({
        createdAt: { $gte: sevenDaysAgo }
    });
};


const generateProfitLossPDF = (reports) => {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'profitLossReports.pdf');
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(25).text('Profit and Loss Reports', { align: 'center' });
    doc.moveDown();

    // Initialize totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalProfit = 0;

    // Add individual reports
    reports.forEach(report => {
        totalIncome += parseFloat(report.incomeTotal);
        totalExpenses += parseFloat(report.expenseTotal);
        totalProfit += parseFloat(report.profit);

        doc.fontSize(12).text(`Period: ${report.period}`);
        doc.text(`Income Total: ${report.incomeTotal}`);
        doc.text(`Expense Total: ${report.expenseTotal}`);
        doc.text(`Profit: ${report.profit}`);
        doc.moveDown();
    });

    // Add summary totals
    doc.fontSize(16).text('Weekly Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Income: ${totalIncome}`);
    doc.text(`Total Expenses: ${totalExpenses}`);
    doc.text(`Total Profit: ${totalProfit}`);

    doc.end();
    return filePath;
};



// Send Email
const sendProfitLossEmail = (filePath) => {

    const mailOptions = {
        from: process.env.EMAIL_HOST,
        to: 'mrwebxpert@gmail.com',
        subject: 'Weekly Profit and Loss Reports',
        text: 'Please find attached the profit and loss reports for the last 7 days.',
        attachments: [
            {
                filename: 'profitLossReports.pdf',
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


const sendWeeklyProfitLossReports = async () => {
    try {
        const reports = await getProfitLossReportsFromLast7Days();
        const filePath = generateProfitLossPDF(reports);
        sendProfitLossEmail(filePath);
    } catch (error) {
        console.error('Error generating or sending profit and loss reports:', error);
    }
};

const job = schedule.scheduleJob('0 0 */7 * * *', function () {
    sendWeeklyProfitLossReports();
});

// For testing purposes (runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//     sendWeeklyProfitLossReports();
// });
