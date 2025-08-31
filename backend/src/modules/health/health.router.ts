import { Router } from 'express';

const router = Router();

// Liveness probe - checks if the application is running
router.get('/liveness', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe - checks if the application is ready to serve traffic
// TODO: Add database connectivity check when more sophisticated health checks are needed
router.get('/readiness', (_req, res) => {
  res.status(200).json({ status: 'ready' });
});

export { router as healthRouter };