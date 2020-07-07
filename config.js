const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT,
  dbHost: process.env.DB_HOST,
  dbAuth: process.env.DB_AUTH,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  gmailUser: process.env.GMAIL_USER,
  gmailPass: process.env.GMAIL_PASS
};
