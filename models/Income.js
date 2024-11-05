const mongoose = require("mongoose")

const incomeSchema = new mongoose.Schema({
  amount: { type: String, required: true },
  date: { type: Date, required: true },
  source: { type: String, },
  expense: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver"
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle"
  },
  deductionReason: [

    {
      reason: { type: String },
      amount: { type: Number },
      description: { type: String }
    },
  ],

  amountToPaid: {
    type: Number,

  }
}, { timestamps: true });

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income