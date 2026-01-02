import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';

const router = Router();

interface BookingRequest extends Request {
  body: {
    alertId: string;
    passengerName: string;
    email: string;
    phone: string;
    seats: number;
    travelDate: string;
  };
}

// Create booking
router.post('/', async (req: BookingRequest, res: Response) => {
  try {
    const { alertId, passengerName, email, phone, seats, travelDate } = req.body;

    // Validate required fields
    if (!passengerName || !email || !phone || !seats || !travelDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const bookingId = uuidv4();
    const now = new Date();

    // Insert booking into database
    const query = `
      INSERT INTO bookings (
        id, alert_id, passenger_name, email, phone, 
        seats, travel_date, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      bookingId,
      alertId || null,
      passengerName,
      email,
      phone,
      seats,
      travelDate,
      'CONFIRMED',
      now,
      now,
    ]);

    const booking = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        id: booking.id,
        bookingId: booking.id,
        passengerName: booking.passenger_name,
        email: booking.email,
        phone: booking.phone,
        seats: booking.seats,
        travelDate: booking.travel_date,
        status: booking.status,
        createdAt: booking.created_at,
      },
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message,
    });
  }
});

// Get booking by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM bookings WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    const booking = result.rows[0];
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
    });
  }
});

// Get user bookings
router.get('/user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const query = 'SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [email]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user bookings',
    });
  }
});

// Update booking status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
      });
    }

    const query = `
      UPDATE bookings 
      SET status = $1, updated_at = $2 
      WHERE id = $3
      RETURNING *;
    `;

    const result = await pool.query(query, [status, new Date(), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
    });
  }
});

export default router;
