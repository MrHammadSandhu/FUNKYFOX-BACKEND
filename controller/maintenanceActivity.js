const { transport } = require("../middleware/nodemailer");
const MaintenanceActivity = require("../models/MaintenanceActivity");
const Vehicle = require("../models/Vehicles");

exports.createMaintenanceActivity = async (req, res) => {
  const { description, cost, date, duration, serviceProvider, status, plateNumber, vehicleName } = req.body
  try {
    const vehicle = await Vehicle.findOne({ plateNumber });
    console.log("numberplate", vehicle)
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    const maintenanceActivity = new MaintenanceActivity({
      description,
      cost,
      date,
      duration,
      serviceProvider,
      status,
      vehicle: vehicle._id,
    });
    await maintenanceActivity.save();
    return res.status(201).json({ data: maintenanceActivity });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getAllMaintenanceActivities = async (req, res) => {
  try {
    const maintenanceActivities = await MaintenanceActivity.find().populate("vehicle");
    res.status(200).json({ data: maintenanceActivities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaintenanceActivityById = async (req, res) => {
  try {
    const maintenanceActivity = await MaintenanceActivity.findById(req.params.id).populate("vehicle", "name plateNumber");
    if (!maintenanceActivity) {
      return res.status(404).json({ message: 'Maintenance activity not found' });
    }
    res.status(200).json(maintenanceActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMaintenanceActivity = async (req, res) => {
  try {
    const maintenanceActivity = await MaintenanceActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!maintenanceActivity) {
      return res.status(404).json({ message: 'Maintenance activity not found' });
    }
    res.status(200).json(maintenanceActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMaintenanceActivity = async (req, res) => {
  try {
    const maintenanceActivity = await MaintenanceActivity.findByIdAndDelete(req.params.id);
    if (!maintenanceActivity) {
      return res.status(404).json({ message: 'Maintenance activity not found' });
    }
    res.status(200).json({ message: 'Maintenance activity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMaintenanceActivitiesFromLast7Days = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return await MaintenanceActivity.find({
    createdAt: { $gte: sevenDaysAgo }
  }).populate('vehicle');
};



const generateMaintenanceReportPDF = (maintenanceActivities) => {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  const doc = new PDFDocument();
  const filePath = path.join(__dirname, 'maintenanceReports.pdf');
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  doc.fontSize(25).text('Maintenance Activity Reports', { align: 'center' });
  doc.moveDown();

  let totalMaintenanceCost = 0;
  maintenanceActivities.forEach(activity => {
    totalMaintenanceCost += parseFloat(activity.cost);

    doc.fontSize(12).text(`Description: ${activity.description}`);
    doc.text(`Cost: $${activity.cost}`);
    doc.text(`Date: ${new Date(activity.date).toLocaleDateString()}`);
    doc.text(`Duration: ${activity.duration} hours`);
    doc.text(`Service Provider: ${activity.serviceProvider}`);
    doc.text(`Status: ${activity.status}`);
    doc.text(`Vehicle: ${activity.vehicle.plateNumber} (${activity.vehicle.name})`);
    doc.text(`Parts Replaced: ${activity.partsReplaced.join(', ')}`);
    doc.moveDown();
  });

  // Add summary totals
  doc.addPage();
  doc.fontSize(25).text('Weekly Summary', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Total Maintenance Cost: $${totalMaintenanceCost.toFixed(2)}`);

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



const sendMaintenanceReportEmail = (filePath) => {

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'mrwebxpert@gmail.com',
    subject: 'Weekly Maintenance Reports',
    text: 'Please find attached the maintenance reports for the last 7 days.',
    attachments: [
      {
        filename: 'maintenanceReports.pdf',
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


const sendWeeklyMaintenanceReports = async () => {
  try {
    const maintenanceActivities = await getMaintenanceActivitiesFromLast7Days();
    const filePath = await generateMaintenanceReportPDF(maintenanceActivities); // Wait for PDF generation to complete
    sendMaintenanceReportEmail(filePath);
  } catch (error) {
    console.error('Error generating or sending maintenance reports:', error);
  }
};

// Schedule the job to run every 7 days
const schedule = require('node-schedule');
const job = schedule.scheduleJob('0 0 */7 * * *', function () {
  sendWeeklyMaintenanceReports();
});

// For testing purposes (runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//   sendWeeklyMaintenanceReports();
// });

