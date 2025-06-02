const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
    return;
  }
  console.log('MySQL Connected...');
});

module.exports = db;
