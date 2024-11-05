const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: { type: Number },
  date: { type: Date, },
  category: { type: String, },
  income: [{ type: mongoose.Schema.Types.ObjectId, ref: "Income" }],
  description: { type: String },
  receiptNumber: { type: String, unique: true },
  paymentMethod: { type: String, },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", }

}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense