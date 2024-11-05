const express = require('express');
const { createOperationalReport, getAllOperationalReports, getOperationalReportById, updateOperationalReport, deleteOperationalReport } = require('../controller/operationalReport');
const operationalReportRouter = express.Router();

operationalReportRouter.post('/operationalreport/register', createOperationalReport);

operationalReportRouter.get('/operationalreport', getAllOperationalReports);

operationalReportRouter.get('/operationalreport/:id', getOperationalReportById);

operationalReportRouter.put('/operationalreport/:id', updateOperationalReport);

operationalReportRouter.delete('/operationalreport/:id', deleteOperationalReport);

module.exports = operationalReportRouter;
