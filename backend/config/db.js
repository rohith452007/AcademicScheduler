const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'timetable_db',
    waitForConnections: true, 
    connectionLimit: 50, 
    queueLimit: 0,
    multipleStatements: true
});

module.exports = pool;