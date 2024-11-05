const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complianceReportSchema = new Schema({

  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: "Vehicle",
    description: 'Unique identifier for the vehicle.'
  },
  inspectionDate: {
    type: Date,

    description: 'The date when the vehicle was last inspected.'
  },
  complianceStatus: {
    type: String,
    description: 'The compliance status of the vehicle.'
  },
  issuesFound: {
    type: String,
    description: 'Details of any issues found during the inspection.'
  },
  resolutionDate: {
    type: Date,
    description: 'The date when the issues were resolved, if any.'
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
    description: 'Unique identifier for the driver.'
  },

  reportDate: {
    type: Date,
    default: Date.now,
    description: 'The date when the report was created.'
  },
  createdBy: {
    type: String,
    description: 'The user who created the report.'
  },
  comments: {
    type: String,
    description: 'Additional comments or notes about the report.'
  },

}, { timestamps: true });

complianceReportSchema.index({ reportDate: 1, createdBy: 1 });

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);