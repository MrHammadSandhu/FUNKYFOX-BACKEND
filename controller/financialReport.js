const FinancialReport = require("../models/FinancialReport");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { transport } = require("../middleware/nodemailer");


exports.createFinancialReport = async (req, res) => {
  try {
    const financialReport = new FinancialReport(req.body);
    await financialReport.save();
    return res.status(201).json({ data: financialReport });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getAllFinancialReports = async (req, res) => {
  try {
    const financialReports = await FinancialReport.find();
    return res.status(200).json(financialReports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getFinancialReportById = async (req, res) => {
  try {
    const financialReport = await FinancialReport.findById(req.params.id);
    if (!financialReport) {
      return res.status(404).json({ message: 'Financial report not found' });
    }
    return res.status(200).json(financialReport);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateFinancialReport = async (req, res) => {
  try {
    const financialReport = await FinancialReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!financialReport) {
      return res.status(404).json({ message: 'Financial report not found' });
    }
    return res.status(200).json(financialReport);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteFinancialReport = async (req, res) => {
  try {
    const financialReport = await FinancialReport.findByIdAndDelete(req.params.id);
    if (!financialReport) {
      return res.status(404).json({ message: 'Financial report not found' });
    }
    return res.status(200).json({ message: 'Financial report deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const getFinancialReportsFromLast7Days = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return await FinancialReport.find({
    createdAt: { $gte: sevenDaysAgo }
  });
};

const generateFinancialPDF = (reports) => {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  const doc = new PDFDocument();
  const filePath = path.join(__dirname, 'financialReports.pdf');
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(25).text('Financial Reports', { align: 'center' });
  doc.moveDown();

  // Initialize totals
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalProfitability = 0;
  let totalGrossProfit = 0;
  let totalOperatingExpenses = 0;
  let totalTaxes = 0;

  // Add individual reports and calculate totals
  reports.forEach(report => {
    totalIncome += parseFloat(report.income);
    totalExpenses += parseFloat(report.expenses);
    totalProfitability += parseFloat(report.profitability);
    totalGrossProfit += parseFloat(report.grossProfit);
    totalOperatingExpenses += parseFloat(report.operatingExpenses);
    totalTaxes += parseFloat(report.taxes);

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

  // Add summary totals
  doc.addPage();
  doc.fontSize(25).text('Weekly Summary', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Total Income: ${totalIncome.toFixed(2)}`);
  doc.text(`Total Expenses: ${totalExpenses.toFixed(2)}`);
  doc.text(`Total Profitability: ${totalProfitability.toFixed(2)}`);
  doc.text(`Total Gross Profit: ${totalGrossProfit.toFixed(2)}`);
  doc.text(`Total Operating Expenses: ${totalOperatingExpenses.toFixed(2)}`);
  doc.text(`Total Taxes: ${totalTaxes.toFixed(2)}`);

  doc.end();
  return filePath;
};

// Send Email
const sendFinancialEmail = (filePath) => {

  const mailOptions = {
    from: process.env.EMAIL_HOST,
    to: 'mrwebxpert@gmail.com',
    subject: 'Weekly Financial Reports',
    text: 'Please find attached the financial reports for the last 7 days.',
    attachments: [
      {
        filename: 'financialReports.pdf',
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

// Send Weekly Financial Reports
const sendWeeklyFinancialReports = async () => {
  try {
    const reports = await getFinancialReportsFromLast7Days();
    const filePath = generateFinancialPDF(reports);
    sendFinancialEmail(filePath);
  } catch (error) {
    console.error('Error generating or sending financial reports:', error);
  }
};

// Schedule the job to run every 7 days
const job = schedule.scheduleJob('0 0 */7 * * *', function () {
  sendWeeklyFinancialReports();
});

// For testing purposes(runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//   sendWeeklyFinancialReports();
// });
