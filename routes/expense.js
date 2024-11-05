const express = require('express');
const { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense, getTotalExpenses, getTotalExpenseByMonth, getTotalExpenseSum } = require('../controller/expenseCtrl');
const expenseRouter = express.Router();

expenseRouter.post('/expense/create', createExpense);
expenseRouter.get('/expense', getAllExpenses);
expenseRouter.get('/expense/:id', getExpenseById);
expenseRouter.get("/sumOfAllExpense", getTotalExpenseSum)
expenseRouter.patch('/expense/:id', updateExpense);
expenseRouter.delete('/expense/:id', deleteExpense);
expenseRouter.get("/totalexpenses", getTotalExpenses)
expenseRouter.get("/getTotalExpenses", getTotalExpenseByMonth)

module.exports = expenseRouter;