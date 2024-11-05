const mongoose = require("mongoose")
const profitLossReportSchema = new mongoose.Schema({
  period: { type: String, },
  incomeTotal: { type: String },
  expenseTotal: { type: String },
  profit: { type: String }
}, { timestamps: true });

const ProfitLossReport = mongoose.model("ProfitLossReport", profitLossReportSchema);

module.exports = ProfitLossReport