import { app } from './app.js';
import { config } from './config/env.js';
import { testConnection } from './db/pool.js';

async function startServer() {
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      console.log('MySQL Database connection verified.');
    }
  } catch (err) {
    console.warn('Warning: Database connection test failed:', err.message);
  }

  app.listen(config.port, () => {
    console.log(`Backend API running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.env}`);
  });
}

startServer();
