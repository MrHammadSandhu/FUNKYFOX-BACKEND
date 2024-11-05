const mongoose = require("mongoose")
const adminSchema = new mongoose.Schema({
   username: { type: String, required: true },
   email: { type: String, required: true },
   phone: { type: String, required: true },
   password: { type: String, required: true },
   userType: { type: String, enum: ["admin"], default: "admin" },
   image: { type: String },
   expense: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense'
   }],
   income: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Income'
   }],

   profitLossReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfitLossReport'
    }]
   
})
// const Admin = mongoose.model("Admin", adminSchema)
exports.Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
// module.exports = Admin