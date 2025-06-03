const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: 'mysql-2804ec4d-kavigimhan.j.aivencloud.com',
  port: 23922,
  user: 'avnadmin',
  password: 'AVNS_WZu1hNCeVg5Atk8XFAp',
  database: 'freelancer_web_app',
  multipleStatements: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : null
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
    return;
  }
  console.log('MySQL Connected...');
});

module.exports = db;
