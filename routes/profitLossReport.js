const express = require('express')
const { createProfitLoss, getAllProfitLossReport, getProfitLossReport, updateProfitLossReport, deleteProfitLossReport, getSingleProfitLossReport } = require('../controller/profitLoss')

const ReportRoutes = express.Router()


ReportRoutes.post('/profitloss/create', createProfitLoss)
ReportRoutes.get("/allreports", getAllProfitLossReport)
ReportRoutes.get("/report/:id", getSingleProfitLossReport)

ReportRoutes.put("/report/:id", updateProfitLossReport)
ReportRoutes.delete("/report/:id", deleteProfitLossReport)


module.exports = ReportRoutes