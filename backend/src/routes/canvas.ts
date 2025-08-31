import { Router } from 'express';
import { prisma } from '../prisma/client.js';

export const canvasRouter = Router();

// GET /api/canvas - List canvases with pagination
canvasRouter.get('/canvas', async (req, res) => {
  // Parse and validate query parameters
  const limitParam = parseInt(String(req.query.limit || '20'));
  const offsetParam = parseInt(String(req.query.offset || '0'));
  
  // Apply validation and clamping
  const limit = Math.min(Math.max(limitParam, 1), 100);
  const offset = Math.max(offsetParam, 0);

  try {
    const items = await prisma.canvas.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const count = items.length;

    res.json({
      data: items,
      pagination: {
        limit,
        offset,
        count,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/canvas/:id - Update canvas
canvasRouter.put('/canvas/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body || {};

  // Validate that at least one field is provided for update
  if (name === undefined && description === undefined) {
    return res.status(400).json({ error: 'At least one of name or description is required' });
  }

  // Validate field lengths if provided
  if (name !== undefined && (!name || name.trim().length === 0)) {
    return res.status(400).json({ error: 'name must be at least 1 character' });
  }

  if (description !== undefined && (!description || description.trim().length === 0)) {
    return res.status(400).json({ error: 'description must be at least 1 character' });
  }

  try {
    // Build update data object with only provided fields
    const updateData: { name?: string; description?: string } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    const canvas = await prisma.canvas.update({
      where: { id },
      data: updateData,
    });

    res.json(canvas);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Canvas not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/canvas/:id - Delete canvas (hard delete)
canvasRouter.delete('/canvas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.canvas.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Canvas not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Add OpenAPI documentation for Canvas endpoints
// - GET /api/canvas: List canvases with pagination support
// - PUT /api/canvas/:id: Update canvas name and/or description
// - DELETE /api/canvas/:id: Delete canvas (returns 204 No Content)