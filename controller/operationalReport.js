const { transport } = require("../middleware/nodemailer");
const OperationalReport = require("../models/OperationalReport");

exports.createOperationalReport = async (req, res) => {
  try {
    const operationalReport = new OperationalReport(req.body);
    await operationalReport.save();
    res.status(201).json(operationalReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOperationalReports = async (req, res) => {
  try {
    const operationalReports = await OperationalReport.find();
    res.status(200).json(operationalReports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOperationalReportById = async (req, res) => {
  try {
    const operationalReport = await OperationalReport.findById(req.params.id);
    if (!operationalReport) {
      return res.status(404).json({ message: 'Operational report not found' });
    }
    res.status(200).json(operationalReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOperationalReport = async (req, res) => {
  try {
    const operationalReport = await OperationalReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!operationalReport) {
      return res.status(404).json({ message: 'Operational report not found' });
    }
    res.status(200).json(operationalReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOperationalReport = async (req, res) => {
  try {
    const operationalReport = await OperationalReport.findByIdAndDelete(req.params.id);
    if (!operationalReport) {
      return res.status(404).json({ message: 'Operational report not found' });
    }
    res.status(200).json({ message: 'Operational report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getOperationalReportsFromLast7Days = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return await OperationalReport.find({
    reportDate: { $gte: sevenDaysAgo }
  });
};
const generateOperationalReportPDF = (reports) => {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  const doc = new PDFDocument();
  const filePath = path.join(__dirname, 'operationalReports.pdf');
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  doc.fontSize(25).text('Operational Reports', { align: 'center' });
  doc.moveDown();

  let totalFleetUtilization = 0;
  let totalDriverPerformance = 0;
  let totalTripEfficiency = 0;
  let reportCount = reports.length;

  reports.forEach(report => {
    totalFleetUtilization += report.fleetUtilization;
    totalDriverPerformance += report.driverPerformance;
    totalTripEfficiency += report.tripEfficiency;

    doc.fontSize(12).text(`Fleet Utilization: ${report.fleetUtilization}%`);
    doc.text(`Driver Performance: ${report.driverPerformance}/10`);
    doc.text(`Trip Efficiency: ${report.tripEfficiency}%`);
    doc.text(`Report Date: ${new Date(report.reportDate).toLocaleDateString()}`);
    doc.text(`Created By: ${report.createdBy}`);
    doc.text(`Comments: ${report.comments}`);
    doc.moveDown();
  });

  // Calculate averages for the summary
  const avgFleetUtilization = (totalFleetUtilization / reportCount).toFixed(2);
  const avgDriverPerformance = (totalDriverPerformance / reportCount).toFixed(2);
  const avgTripEfficiency = (totalTripEfficiency / reportCount).toFixed(2);

  // Add summary totals
  doc.addPage();
  doc.fontSize(25).text('Weekly Summary', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Total Reports: ${reportCount}`);
  doc.text(`Average Fleet Utilization: ${avgFleetUtilization}%`);
  doc.text(`Average Driver Performance: ${avgDriverPerformance}/10`);
  doc.text(`Average Trip Efficiency: ${avgTripEfficiency}%`);

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
const sendOperationalReportEmail = (filePath) => {

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'mrwebxpert@gmail.com',
    subject: 'Weekly Operational Reports',
    text: 'Please find attached the operational reports for the last 7 days.',
    attachments: [
      {
        filename: 'operationalReports.pdf',
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


const sendWeeklyOperationalReports = async () => {
  try {
    const reports = await getOperationalReportsFromLast7Days();
    const filePath = await generateOperationalReportPDF(reports); // Wait for PDF generation to complete
    sendOperationalReportEmail(filePath);
  } catch (error) {
    console.error('Error generating or sending operational reports:', error);
  }
};

// Schedule the job to run every 7 days
const schedule = require('node-schedule');
const job = schedule.scheduleJob('0 0 */7 * * *', function () {
  sendWeeklyOperationalReports();
});

// For testing purposes (runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//   sendWeeklyOperationalReports();
// });
