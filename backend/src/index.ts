import { app } from './server.js';
import { prisma } from './services/prisma.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🏥 Health endpoints available at:`);
      console.log(`   GET http://localhost:${PORT}/health/liveness`);
      console.log(`   GET http://localhost:${PORT}/health/readiness`);
      console.log(`🎨 Canvas API available at:`);
      console.log(`   POST http://localhost:${PORT}/api/canvas`);
      console.log(`   GET  http://localhost:${PORT}/api/canvas`);
      console.log(`   GET  http://localhost:${PORT}/api/canvas/:id`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();