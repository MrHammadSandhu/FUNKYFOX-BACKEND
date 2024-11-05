const nodemailer = require("nodemailer")
 let transport = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_HOST,
        pass: process.env.PASS_KEY
    }
 })
 module.exports = {transport}