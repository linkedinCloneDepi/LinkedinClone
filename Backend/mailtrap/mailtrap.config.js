
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
require("dotenv").config();

// const TOKEN = process.env.MAILTRAP_TOKEN;

// const transport = Nodemailer.createTransport(
//   MailtrapTransport({
//     token: TOKEN,
//   })
// );

module.exports.transporter = Nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SERVER_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

module.exports.sender = {
  address: process.env.SERVER_EMAIL ,
  name: "linkedin clone",
};

// const recipients = [
//   "amiraabdelaziz428@gmail.com",
// ];

// transport
//   .sendMail({
//     from: sender,
//     to: recipients,
//     template_uuid: "40e49ed6-144e-4f9d-9854-5a72ea71d5f6",
//     template_variables: {
//       "name": "Test_Name",
//       "company_info_name": "Test_Company_info_name",
//       "company_info_address": "Test_Company_info_address",
//       "company_info_city": "Test_Company_info_city",
//       "company_info_zip_code": "Test_Company_info_zip_code",
//       "company_info_country": "Test_Company_info_country"
//     }
//   })
//   .then(


