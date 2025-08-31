import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the prisma import before importing the router
vi.mock('../prisma/client.js', () => ({
  prisma: {
    canvas: {
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Import the router after mocking
import { canvasRouter } from '../routes/canvas.js';
import { prisma } from '../prisma/client.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', canvasRouter);

describe('Canvas API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/canvas', () => {
    it('should return paginated canvas list with default parameters', async () => {
      const mockCanvases = [
        { id: '1', name: 'Canvas 1', description: 'Desc 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Canvas 2', description: null, createdAt: new Date(), updatedAt: new Date() },
      ];
      
      vi.mocked(prisma.canvas.findMany).mockResolvedValue(mockCanvases);

      const response = await request(app)
        .get('/api/canvas')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        id: '1',
        name: 'Canvas 1',
        description: 'Desc 1',
      });
      expect(response.body.pagination).toEqual({
        limit: 20,
        offset: 0,
        count: 2,
      });
    });

    it('should handle custom limit and offset parameters', async () => {
      const mockCanvases = [
        { id: '2', name: 'Canvas 2', description: null, createdAt: new Date(), updatedAt: new Date() },
      ];
      
      vi.mocked(prisma.canvas.findMany).mockResolvedValue(mockCanvases);

      const response = await request(app)
        .get('/api/canvas?limit=2&offset=1')
        .expect(200);

      expect(response.body.pagination).toEqual({
        limit: 2,
        offset: 1,
        count: 1,
      });
    });

    it('should clamp limit to maximum of 100', async () => {
      vi.mocked(prisma.canvas.findMany).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/canvas?limit=150')
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
    });
  });

  describe('PUT /api/canvas/:id', () => {
    it('should update canvas with valid data', async () => {
      const updatedCanvas = {
        id: '1',
        name: 'Updated Canvas',
        description: 'Updated description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      vi.mocked(prisma.canvas.update).mockResolvedValue(updatedCanvas);

      const response = await request(app)
        .put('/api/canvas/1')
        .send({ name: 'Updated Canvas', description: 'Updated description' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: '1',
        name: 'Updated Canvas',
        description: 'Updated description',
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 if no fields provided', async () => {
      const response = await request(app)
        .put('/api/canvas/1')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('At least one of name or description is required');
    });

    it('should return 400 if name is empty string', async () => {
      const response = await request(app)
        .put('/api/canvas/1')
        .send({ name: '' })
        .expect(400);

      expect(response.body.error).toBe('name must be at least 1 character');
    });

    it('should return 404 if canvas not found', async () => {
      vi.mocked(prisma.canvas.update).mockRejectedValue({ code: 'P2025' });

      const response = await request(app)
        .put('/api/canvas/nonexistent')
        .send({ name: 'Test' })
        .expect(404);

      expect(response.body.error).toBe('Canvas not found');
    });
  });

  describe('DELETE /api/canvas/:id', () => {
    it('should delete canvas and return 204', async () => {
      vi.mocked(prisma.canvas.delete).mockResolvedValue({} as any);

      await request(app)
        .delete('/api/canvas/1')
        .expect(204);
    });

    it('should return 404 if canvas not found', async () => {
      vi.mocked(prisma.canvas.delete).mockRejectedValue({ code: 'P2025' });

      const response = await request(app)
        .delete('/api/canvas/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Canvas not found');
    });
  });

  describe('Pagination Integration Test', () => {
    it('should correctly paginate when requesting middle subset', async () => {
      // Create 3 canvases, request limit=2 offset=1
      const allCanvases = [
        { id: '1', name: 'Canvas 1', description: 'Desc 1', createdAt: new Date('2024-01-03'), updatedAt: new Date() },
        { id: '2', name: 'Canvas 2', description: 'Desc 2', createdAt: new Date('2024-01-02'), updatedAt: new Date() },
        { id: '3', name: 'Canvas 3', description: 'Desc 3', createdAt: new Date('2024-01-01'), updatedAt: new Date() },
      ];

      // Mock returning the subset (offset=1, limit=2 should return items 2 and 3)
      const expectedSubset = allCanvases.slice(1, 3);
      vi.mocked(prisma.canvas.findMany).mockResolvedValue(expectedSubset);

      const response = await request(app)
        .get('/api/canvas?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        id: '2',
        name: 'Canvas 2',
        description: 'Desc 2',
      });
      expect(response.body.pagination).toEqual({
        limit: 2,
        offset: 1,
        count: 2,
      });
    });
  });
});

// TODO: Add integration tests with real database once Prisma client generation is working
// TODO: Add tests for canvas creation endpoint if added in the future
// TODO: Add OpenAPI documentation validation tests