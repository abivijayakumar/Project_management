require('dotenv').config();
const { initDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  let sequelize;
  try {
    // 1. Initialize database connection (MySQL with automatic dev fallback)
    sequelize = await initDatabase();

    // 2. Load Express app and register routes/models AFTER database instance is active
    const app = require('./app');

    // 3. Synchronize schema
    await sequelize.sync();
    console.log('[Database] Tables synchronized successfully');

    const server = app.listen(PORT, () => {
      console.log(`[Server] Project Management API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(async () => {
        try {
          if (sequelize) await sequelize.close();
          console.log('[Database] Connection closed successfully. Exiting process.');
        } catch (closeErr) {
          console.error('[Database] Error closing connection:', closeErr.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server Startup Aborted] Database initialization failed:', err.message);
    process.exit(1);
  }
};

startServer();
