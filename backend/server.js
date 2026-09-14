require('dotenv').config();
const app = require('./app');
const { initDatabase, sequelize } = require('./src/config/database');

// Ensure models and associations are registered
require('./src/models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize connection and sync tables
    await initDatabase();
  } catch (err) {
    console.error('[Server Startup Aborted] Database initialization failed. Exiting process.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Project Management API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(async () => {
      try {
        await sequelize.close();
        console.log('[Database] Connection closed successfully. Exiting process.');
      } catch (closeErr) {
        console.error('[Database] Error closing connection:', closeErr.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
