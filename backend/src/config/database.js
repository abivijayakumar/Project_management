const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');

const DB_NAME = process.env.DB_NAME || 'project_management';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;

const isSqlite = process.env.DB_DIALECT === 'sqlite';

let sequelize;

if (isSqlite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../dev-storage.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: false
    }
  });
} else {
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    }
  });
}

/**
 * Ensures the target MySQL database exists by executing CREATE DATABASE IF NOT EXISTS
 */
async function ensureDatabaseExists() {
  if (isSqlite) return;

  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();
  } catch (error) {
    console.warn(`[MySQL Connection Warning] Could not connect to MySQL server: ${error.message}`);
    throw error;
  }
}

/**
 * Initialize and synchronize Sequelize database
 */
async function initDatabase() {
  try {
    if (!isSqlite) {
      await ensureDatabaseExists();
    }

    await sequelize.authenticate();
    console.log(`[Database] Connected successfully (${isSqlite ? 'SQLite' : `MySQL: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`})`);

    await sequelize.sync({ alter: true });
    console.log('[Database] Schema synchronized successfully');
    return sequelize;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.warn('\n[MySQL Configuration Tip]');
    console.warn('1. Make sure the MySQL Windows service (MySQL80) is running.');
    console.warn('2. Provide your root password in backend/.env (e.g. DB_PASSWORD=your_password).');
    console.warn('3. Alternatively, you can set DB_DIALECT=sqlite in backend/.env for zero-config testing.\n');
    throw error;
  }
}

module.exports = {
  sequelize,
  initDatabase,
  getSequelize: () => sequelize
};
