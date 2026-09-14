require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  let mongoURI = process.env.MONGODB_URI;

  try {
    if (!mongoURI) {
      mongoURI = 'mongodb://127.0.0.1:27017/project_management';
    }

    // Attempt primary connection
    console.log(`[MongoDB] Connecting to: ${mongoURI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('[MongoDB] Connected successfully to database');
  } catch (err) {
    console.warn(`[MongoDB] Warning: Could not connect to primary MongoDB (${err.message})`);

    // In development, attempt to spin up an in-memory MongoDB fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Initializing in-memory MongoDB instance for local demonstration...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log(`[MongoDB] Connected successfully to in-memory fallback: ${memUri}`);
      } catch (memErr) {
        console.error('[MongoDB Fatal] In-memory fallback failed:', memErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // Auto-seed in development if database is empty
  if (process.env.NODE_ENV !== 'production') {
    try {
      const User = require('./src/models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('[MongoDB] Database is empty. Seeding initial demo projects and tasks...');
        const { seedData } = require('./src/seeds/seedData');
        await seedData();
      }
    } catch (seedErr) {
      console.warn('[MongoDB] Auto-seed warning:', seedErr.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Project Management API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(async () => {
      await mongoose.connection.close();
      console.log('[MongoDB] Connection closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
