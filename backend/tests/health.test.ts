import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { healthRouter } from '../src/modules/health/health.router.js';

// Create a minimal test app with just the health router
const testApp = express();
testApp.use('/health', healthRouter);

describe('Health Endpoints', () => {
  describe('GET /health/liveness', () => {
    it('should return 200 with alive status', async () => {
      const response = await request(testApp)
        .get('/health/liveness')
        .expect(200);

      expect(response.body).toEqual({ status: 'alive' });
    });
  });

  describe('GET /health/readiness', () => {
    it('should return 200 with ready status', async () => {
      const response = await request(testApp)
        .get('/health/readiness')
        .expect(200);

      expect(response.body).toEqual({ status: 'ready' });
    });
  });
});