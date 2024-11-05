const Admin = require("../models/Admin");
const Income = require("../models/Income");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicles");
const moment = require('moment');
const { transport } = require("../middleware/nodemailer");

// exports.createIncome = async (req, res) => {
//     const { date, source, amount, plateNumber, email, deductionReason } = req.body;
//     console.log('here is numberplatte', plateNumber)

//     try {
//         const vehicle = await Vehicle.findOne({ plateNumber });
//         console.log("here is vehicle", vehicle)
//         console.log(vehicle)
//         if (!vehicle) {
//             return res.status(404).json({ message: 'Vehicle not found' });
//         }

//         const driver = await Driver.findOne({ email });
//         console.log(driver)
//         if (!driver) {
//             return res.status(404).json({ message: 'Driver not found' });
//         }


//         let subtractedAmount;
//         const vehicleName = vehicle.name.toLowerCase();


//         switch (vehicleName) {
//             case "bmw":
//             case "audi":
//                 subtractedAmount = amount - 4000;
//                 break;
//             case "toyota":
//             case "nissan":
//                 subtractedAmount = amount - 2500;
//                 break;
//             case "ford":
//             case "hyundai":
//                 subtractedAmount = amount - 2300;
//                 break;
//             case "suzuki":
//                 subtractedAmount = amount - 3000;
//                 break;
//             default:
//                 subtractedAmount = amount; // If the vehicle name doesn't match any case
//         }
//         const income = new Income({
//             amount,
//             source,
//             date,
//             vehicle: vehicle._id,
//             driver: driver._id,
//             amountToPaid: subtractedAmount,
//             deductionReason,
//         })

//         await income.save();

//         vehicle.incomes.push(income._id);
//         await vehicle.save();

//         res.status(201).json({ message: 'icome record added', income });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(400).json({ error: error.message });
//     }
// };


exports.createIncome = async (req, res) => {
    const { date, source, amount, plateNumber, email, deductionReason } = req.body;
    console.log('here is numberplate', plateNumber);

    try {
        const vehicle = await Vehicle.findOne({ plateNumber });
        // console.log("here is vehicle", vehicle);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        let subtractedAmount;
        const vehicleName = vehicle.name.toLowerCase();

        switch (vehicleName) {
            case "bmw":
            case "audi":
                subtractedAmount = amount - 4000;
                break;
            case "toyota":
            case "nissan":
                subtractedAmount = amount - 2500;
                break;
            case "ford":
            case "hyundai":
                subtractedAmount = amount - 2300;
                break;
            case "suzuki":
                subtractedAmount = amount - 3000;
                break;
            default:
                subtractedAmount = amount; // If the vehicle name doesn't match any case
        }

        // Calculate total deduction from the deductionReason
        const deductions = Array.isArray(deductionReason) ? deductionReason : [];

        const totalDeduction = deductions.reduce((sum, reason) => sum + (reason.amount || 0), 0);

        // Final amount after subtracting deductions
        const finalAmount = subtractedAmount - totalDeduction;

        const income = new Income({
            amount,
            source,
            date,
            vehicle: vehicle._id,
            driver: driver._id,
            amountToPaid: finalAmount,
            deductionReason,
        });

        await income.save();

        vehicle.incomes.push(income._id);
        await vehicle.save();

        res.status(201).json({ message: 'Income record added', income });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ error: error.message });
    }
};


exports.getAllIncomes = async (req, res) => {
    try {
        const incomes = await Income.find()
            .populate("driver")
            .populate("vehicle", "name plateNumber model")
            .populate("expense");
        res.status(200).send(incomes);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getIncomeById = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id).populate("vehicle", "name plateNumber").populate("driver", "username email");
        if (!income) return res.status(404).send();
        res.status(200).send(income);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getDriversIncome = (req, res) => {
    const { totalIncome, percentage } = req.body;

    try {
        const percen = (percentage * totalIncome) / 100;

        console.log(percen);

        const driversIncome = totalIncome - percen;
        const profit = totalIncome - driversIncome;

        res.status(200).json({ profit, driversIncome });
    } catch (error) {
        return res.status(500).json({ message: "Some error in server" });
    }
}


// exports.updateIncome = async (req, res) => {
//     try {
//         const income = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//         if (!income) return res.status(404).send();
//         return res.status(200).send(income);
//     } catch (error) {
//         return res.status(400).send(error);
//     }
// };
// exports.updateIncome = async (req, res) => {
//     try {
//         // Find the existing income record by ID
//         const income = await Income.findById(req.params.id);
//         if (!income) return res.status(404).send();

//         // Get the updated data from request body
//         const { amount, deductionReason } = req.body;

//         // Calculate the total deduction from the updated deductionReason
//         const deductions = Array.isArray(deductionReason) ? deductionReason : [];
//         const totalDeduction = deductions.reduce((sum, reason) => sum + (reason.amount || 0), 0);

//         // Recalculate the subtractedAmount based on the vehicle name
//         const vehicle = await Vehicle.findById(income.vehicle);
//         if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

//         let subtractedAmount;
//         const vehicleName = vehicle.name.toLowerCase();

//         switch (vehicleName) {
//             case "bmw":
//             case "audi":
//                 subtractedAmount = amount - 4000;
//                 break;
//             case "toyota":
//             case "nissan":
//                 subtractedAmount = amount - 2500;
//                 break;
//             case "ford":
//             case "hyundai":
//                 subtractedAmount = amount - 2300;
//                 break;
//             case "suzuki":
//                 subtractedAmount = amount - 3000;
//                 break;
//             default:
//                 subtractedAmount = amount; // If the vehicle name doesn't match any case
//         }

//         // Final amount after subtracting deductions
//         const finalAmount = subtractedAmount - totalDeduction;

//         // Update the income record with new values
//         income.amount = amount;
//         income.deductionReason = deductionReason;
//         income.amountToPaid = finalAmount;

//         const updatedIncome = await income.save();

//         res.status(200).send(updatedIncome);
//     } catch (error) {
//         return res.status(400).send(error);
//     }
// };

exports.updateIncome = async (req, res) => {
    try {
        // Find the existing income record by ID
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).send({ message: 'Income record not found' });

        // Get the updated data from request body
        const { amount, deductionReason } = req.body;

        // Fetch the vehicle details to determine the subtracted amount
        const vehicle = await Vehicle.findById(income.vehicle);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        // Recalculate the subtractedAmount based on the vehicle name
        let subtractedAmount;
        const vehicleName = vehicle.name.toLowerCase();

        switch (vehicleName) {
            case "bmw":
            case "audi":
                subtractedAmount = amount - 4000;
                break;
            case "toyota":
            case "nissan":
                subtractedAmount = amount - 2500;
                break;
            case "ford":
            case "hyundai":
                subtractedAmount = amount - 2300;
                break;
            case "suzuki":
                subtractedAmount = amount - 3000;
                break;
            default:
                subtractedAmount = amount; // If the vehicle name doesn't match any case
        }

        // Calculate total deduction from the updated deductionReason
        const deductions = Array.isArray(deductionReason) ? deductionReason : [];
        const totalDeduction = deductions.reduce((sum, reason) => sum + (reason.amount || 0), 0);

        // Final amount after subtracting deductions
        const finalAmount = subtractedAmount - totalDeduction;

        // Update the income record with new values
        income.amount = amount;
        income.deductionReason = deductions; // Set the updated deductions
        income.amountToPaid = finalAmount;

        const updatedIncome = await income.save();

        res.status(200).send(updatedIncome);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

exports.deleteIncome = async (req, res) => {
    const { id } = req.params
    try {
        const income = await Income.findByIdAndDelete(id);
        if (!income) return res.status(404).send();
        return res.status(200).send(income);
    } catch (error) {
        return res.status(500).send(error);
    }
};


// exports.getTotalIncomeByMonth = async (req, res) => {
//     try {
//         const totalIncome = await Income.aggregate([
//             {
//                 $group: {
//                     _id: { $month: { $toDate: "$date" } }, // Grouping by month
//                     total: { $sum: { $toDouble: "$amount" } }
//                 }
//             },
//             {
//                 $sort: { "_id": 1 } // Optionally sort by month
//             }
//         ]);

//         if (totalIncome.length === 0) {
//             return res.status(404).json({ message: "No incomes found" });
//         }

//         // Optionally, format the result to include month names or other details
//         const formattedIncome = totalIncome.map(item => ({
//             month: moment().month(item._id - 1).format('MMMM'), // Formatting month
//             total: item.total
//         }));

//         res.status(200).json({ totalIncomeByMonth: formattedIncome });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

exports.getTotalIncomeByMonth = async (req, res) => {
    try {
        const totalIncomeByMonth = await Income.aggregate([
            {
                $group: {
                    _id: { $month: { $toDate: "$date" } }, // Grouping by month
                    total: { $sum: { $toDouble: "$amount" } }
                }
            },
            {
                $sort: { "_id": 1 } // Sort by month
            }
        ]);

        const overallTotalIncome = await Income.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        // Calculate overall total income
        const overallTotal = overallTotalIncome.length > 0 ? overallTotalIncome[0].total : 0;

        if (totalIncomeByMonth.length === 0) {
            return res.status(404).json({ message: "No incomes found" });
        }

        // Format the result to include month names and total income
        const formattedIncomeByMonth = totalIncomeByMonth.map(item => ({
            month: moment().month(item._id - 1).format('MMMM'), // Formatting month
            total: item.total
        }));

        res.status(200).json({
            totalIncomeByMonth: formattedIncomeByMonth,
            overallTotalIncome: overallTotal
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getTotalIncomeSum = async (req, res) => {
    try {
        const totalSum = await Income.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        if (totalSum.length === 0) {
            return res.status(404).json({ message: "No incomes found" });
        }

        const formattedTotalSum = totalSum[0].total;

        res.status(200).json({ totalIncomeSum: formattedTotalSum });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};
const getIncomeFromLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await Income.find({
        createdAt: { $gte: sevenDaysAgo }
    }).populate('vehicle').populate('driver');
};

const generateIncomeReportPDF = (incomes) => {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'incomeReports.pdf');
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fontSize(25).text('Income Reports', { align: 'center' });
    doc.moveDown();

    let totalIncome = 0;
    incomes.forEach(income => {
        totalIncome += parseFloat(income.amount);

        doc.fontSize(12).text(`Amount: ${income.amount}`);
        doc.text(`Source: ${income.source}`);
        doc.text(`Date: ${new Date(income.date).toLocaleDateString()}`);
        doc.text(`Driver: ${income.driver.username} (${income.driver.email})`);
        doc.text(`Vehicle: ${income.vehicle.plateNumber} (${income.vehicle.model})`);
        doc.moveDown();
    });

    // Add summary totals
    doc.addPage();
    doc.fontSize(25).text('Weekly Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Income: ${totalIncome.toFixed(2)}`);

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

const sendIncomeReportEmail = (filePath) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mrwebxpert@gmail.com',
        subject: 'Weekly Income Reports',
        text: 'Please find attached the income reports for the last 7 days.',
        attachments: [
            {
                filename: 'incomeReports.pdf',
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

const sendWeeklyIncomeReports = async () => {
    try {
        const incomes = await getIncomeFromLast7Days();
        const filePath = await generateIncomeReportPDF(incomes); // Wait for PDF generation to complete
        sendIncomeReportEmail(filePath);
    } catch (error) {
        console.error('Error generating or sending income reports:', error);
    }
};

// Schedule the job to run every 7 days
const schedule = require('node-schedule');
const job = schedule.scheduleJob('0 0 */7 * * *', function () {
    sendWeeklyIncomeReports();
});

// For testing purposes (runs every minute):
// const job = schedule.scheduleJob('*/1 * * * *', function () {
//     sendWeeklyIncomeReports();
// });

