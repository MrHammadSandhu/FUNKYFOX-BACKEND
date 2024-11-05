const express = require('express');
const { createComplianceReport, getAllComplianceReports, getComplianceReportById, updateComplianceReportById, deleteComplianceReportById,  } = require('../controller/complianceReport');
const complianceRoute = express.Router();

complianceRoute.post('/compliance/register', createComplianceReport);
complianceRoute.get('/compliance',getAllComplianceReports);
complianceRoute.get('/compliance/:id',getComplianceReportById);
complianceRoute.put('/compliance/:id',updateComplianceReportById);
complianceRoute.delete('/compliance/:id',deleteComplianceReportById);

module.exports = complianceRoute;
