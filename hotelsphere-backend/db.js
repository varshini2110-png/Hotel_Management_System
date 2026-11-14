const { Pool } = require('pg');

const pool = new Pool({
  user: 'mac',
  host: 'localhost',
  database: 'hotelsphere',
  password: '',
  port: 5432,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database (hotelsphere)');
});

module.exports = pool;