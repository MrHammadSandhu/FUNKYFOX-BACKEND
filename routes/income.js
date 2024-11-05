const express = require('express');
const { createIncome, getAllIncomes, getIncomeById, updateIncome, deleteIncome, getDriversIncome, getTotalIncomeRate, getTotalIncomeByMonth, getTotalIncomeSum } = require('../controller/incomeCtrl');
const incomeRoute = express.Router();

incomeRoute.post('/income/create', createIncome);


incomeRoute.get('/allincome', getAllIncomes);
incomeRoute.get('/sumOfAllIncomes', getTotalIncomeSum)


incomeRoute.get('/income/:id', getIncomeById);

incomeRoute.post('/income/drivers', getDriversIncome);

incomeRoute.patch('/updateincome/:id', updateIncome);


incomeRoute.delete('/delete/income/:id', deleteIncome);


incomeRoute.get('/getIncomeTotal', getTotalIncomeByMonth)
module.exports = incomeRoute;