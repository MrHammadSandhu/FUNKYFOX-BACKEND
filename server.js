require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5080;
const cors = require('cors');
const connectDB = require('./database/db');
const vehicleRoute = require("./routes/vehicleRoutes");
const driverRouter = require("./routes/diverRoutes");
const mainteanceRoute = require("./routes/maintenanceRoutes");
const expenseRouter = require("./routes/expense");
const incomeRoute = require("./routes/income");
const ReportRoutes = require("./routes/profitLossReport");
const financialRouter = require("./routes/financialReport");
const maintenanceActivityRouter = require("./routes/maintenanceActivity");
const operationalReportRouter = require("./routes/operationalReport");
const accidentRoute = require("./routes/accidentRoutes");
const rentalRoute = require("./routes/rentalRoute");
const complianceRoute = require("./routes/complianceReport");
const trafficFineRoute = require("./routes/traficFinesRoutes");
const adminRouter = require("./routes/admin");
app.use(express.json());
connectDB();
app.use(cors({ limit: '150mb' }));

app.use('/api/v1', vehicleRoute)
app.use('/api/v1', driverRouter)
app.use('/api/v1', mainteanceRoute)
app.use("/api/v1", adminRouter)
app.use("/api/v1", expenseRouter)
app.use("/api/v1", incomeRoute)
app.use("/api/v1", ReportRoutes)
app.use("/api/v1", complianceRoute)
app.use("/api/v1", financialRouter)
app.use("/api/v1", maintenanceActivityRouter)
app.use("/api/v1", operationalReportRouter)

app.use("/api/v1", trafficFineRoute)
app.use("/api/v1", accidentRoute)
app.use("/api/v1", rentalRoute)


app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});
