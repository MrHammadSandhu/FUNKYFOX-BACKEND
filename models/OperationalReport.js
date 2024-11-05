const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const operationalReportSchema = new Schema({
  fleetUtilization: {
    type: Number,
    description: 'Percentage of fleet utilization. Should be between 0 and 100.'
  },
  driverPerformance: {
    type: Number,
    description: 'Driver performance rating. Should be between 0 and 10.'
  },
  tripEfficiency: {
    type: Number,
    description: 'Percentage of trip efficiency. Should be between 0 and 100.'
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
  }
}, {
  timestamps: true
}, { timestamps: true });

operationalReportSchema.index({ reportDate: 1, createdBy: 1 });

module.exports = mongoose.model('OperationalReport', operationalReportSchema);
