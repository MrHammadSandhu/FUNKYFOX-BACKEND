const express = require('express');
const adminRouter = express.Router();
const multer = require('multer');
const { userAuth } = require('../middleware/userAuth.js');
const { register, login, getAdmin, updateAdmin, admins, deleteAdmin, resetPasswordEmail, resetPasswordToken, changePassword, getImage, getAllIncome } = require('../controller/admin.js');

const storage = multer.memoryStorage()
const upload = multer({ storage })

adminRouter.post("/admin/register", upload.single("image"), register)
adminRouter.post('/login', login)
adminRouter.get("/admin/get/:id", getAdmin)
adminRouter.patch("/admin/update/:id", updateAdmin)
adminRouter.get("/admin/all", admins)
adminRouter.delete("/admin/delete/:id", deleteAdmin)
adminRouter.post("/admin/reset-email", resetPasswordEmail)
adminRouter.post("/admin/reset-new-password/:id/:token", resetPasswordToken)
adminRouter.post("/admin/changepassword", userAuth, changePassword);
adminRouter.get("/image/:id", getImage);
adminRouter.get('/admin/income', getAllIncome);
module.exports = adminRouter