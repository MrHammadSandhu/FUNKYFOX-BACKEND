const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const financialReportSchema = new Schema({
  income: {
    type: Number,
    
    min: 0,
    description: 'Total income for the reporting period.'
  },
  expenses: {
    type: Number,
    
    min: 0,
    description: 'Total expenses for the reporting period.'
  },
  profitability: {
    type: Number,
    
    description: 'Net profitability for the reporting period. Calculated as income minus expenses.'
  },
  revenueStreams: {
    type: Map,
    of: Number,
    description: 'Breakdown of income by different revenue streams.'
  },
  expenseCategories: {
    type: Map,
    of: Number,
    description: 'Breakdown of expenses by different categories.'
  },
  netProfitMargin: {
    type: Number,
    
    description: 'Net profit margin for the reporting period, calculated as (profitability / income) * 100.'
  },
  grossProfit: {
    type: Number,
    
    description: 'Gross profit for the reporting period, calculated as income minus cost of goods sold (COGS).'
  },
  grossProfitMargin: {
    type: Number,
    
    description: 'Gross profit margin for the reporting period, calculated as (grossProfit / income) * 100.'
  },
  operatingExpenses: {
    type: Number,
    
    min: 0,
    description: 'Total operating expenses for the reporting period.'
  },
  ebitda: {
    type: Number,
    
    description: 'Earnings before interest, taxes, depreciation, and amortization for the reporting period.'
  },
  taxes: {
    type: Number,
    
    description: 'Total taxes for the reporting period.'
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
});

financialReportSchema.index({ reportDate: 1, createdBy: 1 });

module.exports = mongoose.model('FinancialReport', financialReportSchema);
