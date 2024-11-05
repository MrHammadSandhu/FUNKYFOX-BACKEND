const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const maintenanceActivitySchema = new Schema({
  description: {
    type: String,
    required: true,
    description: 'Detailed description of the maintenance activity.'
  },
  date: {
    type: Date,
    required: true,
    description: 'The date when the maintenance activity is scheduled or was completed.'
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
    description: 'The cost of the maintenance activity.'
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
    description: 'The duration of the maintenance activity in hours.'
  },
  partsReplaced: {
    type: [String],
    description: 'List of parts that were replaced during the maintenance activity.'
  },
  serviceProvider: {
    type: String,
    required: true,
    description: 'The service provider or mechanic who performed the maintenance.'
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'Completed'],
    description: 'The status of the maintenance activity.'
  },
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
  },


}, { timestamps: true });

const MaintenanceActivity = new mongoose.model("MaintenanceActivity", maintenanceActivitySchema)

module.exports = MaintenanceActivity