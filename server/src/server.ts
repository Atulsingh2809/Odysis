import { createApp } from './app.js';
import { config } from './config/index.js';
import prisma from './config/database.js';

const app = createApp();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(config.port, () => {
      console.log(`GlobeTrotter API running on http://localhost:${config.port}`);
      console.log(`API docs: http://localhost:${config.port}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
