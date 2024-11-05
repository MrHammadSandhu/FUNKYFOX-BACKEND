const { transport } = require("../middleware/nodemailer");
const Expense = require("../models/Expense");
const Vehicle = require('../models/Vehicles')
const moment = require('moment')


exports.createExpense = async (req, res) => {
    try {
        const { amount, date, category, description, receiptNumber, paymentMethod, plateNumber } = req.body;

        const vehicle = await Vehicle.findOne({ plateNumber: plateNumber });
        if (!vehicle) {
            return res.status(400).json({ message: "Vehicle not found" });
        }

        const expense = new Expense({
            amount,
            date,
            category,
            description,
            receiptNumber,
            paymentMethod,
            vehicle: vehicle._id
        });

        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




exports.getAllExpenses = async (req, res) => {
    try {
        const Expenses = await Expense.find().populate('vehicle');
        res.status(200).send(Expenses);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getExpenseById = async (req, res) => {
    const { id } = req.params
    try {
        const expenseRecord = await Expense.findById(id).populate("vehicle");
        if (!expenseRecord) return res.status(404).json({ message: "No expense record found" });
        return res.status(201).json({ success: false, data: expenseRecord })
    } catch (error) {
        return res.status(500).json({ success: false, message: "error while getting expense", error: error.message });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params
    const body = req.body
    try {
        const expenseRecord = await Expense.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!expenseRecord) return res.status(404).json({ message: "no expense record found" });

        return res.status(201).json({ success: true, message: "expense updated successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params
    try {
        const expenseRecord = await Expense.findByIdAndDelete(id);
        if (!expenseRecord) return res.status(404).json({ message: "No expense record found" })
        return res.status(201).json({ success: true, message: "expense deleted successfully" })
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getTotalExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        const totalExpenses = expenses.reduce((acc, current) => acc + current.amount, 0);
        return res.status(200).json({ data: totalExpenses });
    } catch (error) {
        return res.status(500).send(error);
    }
};

// exports.getTotalExpenseByMonth = async (req, res) => {
//     try {
//         const totalExpense = await Expense.aggregate([
//             {
//                 $group: {
//                     _id: { $month: { $toDate: "$date" } },
//                     total: { $sum: { $toDouble: "$amount" } }
//                 }
//             },
//             {
//                 $sort: { "_id": 1 }
//             }
//         ])
//         if (totalExpense.length === 0) {
//             return res.status(404).json({ message: "No expense found" })
//         }
//         const formattedExpense = totalExpense.map(item => ({
//             month: moment().month(item._id - 1).format('MMMM'),
//             total: item.total
//         }))
//         res.status(200).json({
//             totalExpenseByMonth: formattedExpense
//         })
//     } catch (error) {
//         console.error("Error", error)
//         return res.status(500).json({ error: error.message })
//     }
// }



exports.getTotalExpenseByMonth = async (req, res) => {
    try {
        const totalExpense = await Expense.aggregate([
            {
                $group: {
                    _id: { $month: { $toDate: "$date" } },
                    total: { $sum: { $toDouble: "$amount" } }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        if (totalExpense.length === 0) {
            return res.status(404).json({ message: "No expenses found" });
        }

        const formattedExpense = totalExpense.map(item => ({
            month: moment().month(item._id - 1).format('MMMM'),
            total: item.total
        }));

        res.status(200).json({ totalExpenseByMonth: formattedExpense });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};



exports.getTotalExpenseSum = async (req, res) => {
    try {
        const totalSum = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        if (totalSum.length === 0) {
            return res.status(404).json({ message: "No expenses found" });
        }

        const formattedTotalSum = totalSum[0].total;

        res.status(200).json({ totalExpenseSum: formattedTotalSum });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const getExpenseReportsFromLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await Expense.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle')
};

const generateExpensePDF = (reports) => {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'expenseReports.pdf');
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(25).text('Expense Reports', { align: 'center' });
    doc.moveDown();

    // Initialize totals for the summary
    let totalAmount = 0;

    reports.forEach(report => {
        totalAmount += parseFloat(report.amount);

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

    // Add summary totals
    doc.addPage();
    doc.fontSize(25).text('Weekly Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Expenses: ${totalAmount.toFixed(2)}`);

    doc.end();
    return filePath;
};
const sendExpenseEmail = (filePath) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mrwebxpert@gmail.com',
        subject: 'Weekly Expense Reports',
        text: 'Please find attached the expense reports for the last 7 days.',
        attachments: [
            {
                filename: 'expenseReports.pdf',
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

const sendWeeklyExpenseReports = async () => {
    try {
        const reports = await getExpenseReportsFromLast7Days();
        const filePath = generateExpensePDF(reports);
        sendExpenseEmail(filePath);
    } catch (error) {
        console.error('Error generating or sending expense reports:', error);
    }
};

// Schedule the job to run every 7 days
const schedule = require('node-schedule');
// const job = schedule.scheduleJob('0 0 */7 * * *', function () {
//     sendWeeklyExpenseReports();
// });

// For testing purposes (runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//     sendWeeklyExpenseReports();
// });

