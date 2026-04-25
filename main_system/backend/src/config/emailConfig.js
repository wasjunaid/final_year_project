require("dotenv").config();
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

module.exports = { transport, EMAIL_USER };