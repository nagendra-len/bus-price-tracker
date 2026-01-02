import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

interface AuthRequest extends Request {
  headers: {
    authorization?: string;
  };
}

// Get all alerts for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // In production, verify JWT here
    // For now, we'll skip token verification
    const userId = 1; // Would be extracted from JWT

    const result = await query(
      `SELECT a.*, br.source, br.destination, br.operator 
       FROM alerts a 
       JOIN bus_routes br ON a.route_id = br.id 
       WHERE a.user_id = $1 AND a.is_active = true`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create new alert
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { route_id, target_price } = req.body;
    const userId = 1; // Would be extracted from JWT

    const result = await query(
      `INSERT INTO alerts (user_id, route_id, target_price) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, route_id, target_price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { target_price, is_active } = req.body;

    const result = await query(
      `UPDATE alerts 
       SET target_price = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [target_price, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete alert
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM alerts WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
