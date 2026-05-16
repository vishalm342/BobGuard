const { PrismaClient } = require('@prisma/client');
try {
  console.log('Attempting to initialize PrismaClient...');
  const prisma = new PrismaClient({ log: ['query'] });
  console.log('PrismaClient initialized successfully.');
  prisma.$connect()
    .then(() => {
      console.log('Connected to DB');
      process.exit(0);
    })
    .catch(err => {
      console.error('Connection error:', err);
      process.exit(1);
    });
} catch (error) {
  console.error('Initialization error caught:', error);
  process.exit(1);
}
