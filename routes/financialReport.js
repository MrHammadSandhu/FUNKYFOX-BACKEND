const express = require('express');
const { createFinancialReport, getAllFinancialReports, getFinancialReportById, updateFinancialReport, deleteFinancialReport } = require('../controller/financialReport');
const financialRouter = express.Router();

financialRouter.post('/financial/register', createFinancialReport);

financialRouter.get('/financial', getAllFinancialReports);

financialRouter.get('/financial/:id', getFinancialReportById);

financialRouter.put('/financial/:id', updateFinancialReport);

financialRouter.delete('/financial/:id', deleteFinancialReport);

module.exports = financialRouter;
