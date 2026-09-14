const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');

let sequelizeInstance = null;

/**
 * Initialize Sequelize database connection (MySQL with automatic SQLite dev fallback)
 */
async function initDatabase() {
  if (sequelizeInstance) return sequelizeInstance;

  const DB_NAME = process.env.DB_NAME || 'project_management';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || '';
  const DB_HOST = process.env.DB_HOST || '127.0.0.1';
  const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;

  let forceSqlite = process.env.DB_DIALECT === 'sqlite';

  if (!forceSqlite) {
    try {
      console.log(`[Database] Attempting MySQL connection to ${DB_HOST}:${DB_PORT} (user: ${DB_USER})...`);
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

      sequelizeInstance = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
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

      await sequelizeInstance.authenticate();
      console.log(`[Database] Connected successfully to MySQL: '${DB_NAME}' at ${DB_HOST}:${DB_PORT}`);
      return sequelizeInstance;
    } catch (mysqlErr) {
      console.warn(`\n⚠️ [MySQL Connection Notice] Could not connect to MySQL: ${mysqlErr.message}`);
      if (process.env.NODE_ENV !== 'production') {
        console.warn('💡 [Fallback Active] Starting with local SQLite (backend/dev-storage.sqlite) so the app works immediately.');
        console.warn('💡 To use MySQL: Enter your root password in backend/.env (DB_PASSWORD=your_password) and restart.\n');
        forceSqlite = true;
      } else {
        throw mysqlErr;
      }
    }
  }

  // SQLite Fallback for local development
  const storagePath = path.join(__dirname, '../../dev-storage.sqlite');
  sequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
    define: {
      timestamps: true,
      underscored: false
    }
  });

  await sequelizeInstance.authenticate();
  console.log(`[Database] Connected to SQLite database: ${storagePath}`);
  return sequelizeInstance;
}

function getSequelize() {
  if (!sequelizeInstance) {
    // If accessed before initDatabase, initialize fallback instance
    const storagePath = path.join(__dirname, '../../dev-storage.sqlite');
    sequelizeInstance = new Sequelize({
      dialect: 'sqlite',
      storage: storagePath,
      logging: false,
      define: {
        timestamps: true,
        underscored: false
      }
    });
  }
  return sequelizeInstance;
}

module.exports = {
  initDatabase,
  getSequelize
};
