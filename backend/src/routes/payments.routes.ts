import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import db from '../database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

/**
 * POST /api/payments/create-order
 * Create a payment order for a booking
 */
router.post('/create-order', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { bookingId, amount, currency = 'INR', description } = req.body;
    const userId = (req as any).userId;

    // Validate input
    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify booking belongs to user
    const bookingResult = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: currency,
      receipt: `booking_${bookingId}`,
      description: description || `Payment for booking #${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: userId.toString()
      }
    });

    // Save order details to database
    await db.query(
      `INSERT INTO payment_orders (booking_id, razorpay_order_id, amount, currency, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [bookingId, order.id, amount, currency, 'created']
    );

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/**
 * POST /api/payments/verify
 * Verify payment signature from Razorpay
 */
router.post('/verify', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
    const userId = (req as any).userId;

    // Validate input
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update order status
    await db.query(
      `UPDATE payment_orders 
       SET status = $1, razorpay_payment_id = $2, verified_at = NOW()
       WHERE razorpay_order_id = $3`,
      ['completed', razorpayPaymentId, razorpayOrderId]
    );

    // Update booking status
    await db.query(
      `UPDATE bookings 
       SET status = $1, payment_status = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4`,
      ['confirmed', 'paid', bookingId, userId]
    );

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

/**
 * GET /api/payments/order/:orderId
 * Get payment order details
 */
router.get('/order/:orderId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).userId;

    const result = await db.query(
      `SELECT po.*, b.user_id FROM payment_orders po
       JOIN bookings b ON po.booking_id = b.id
       WHERE po.razorpay_order_id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];

    // Check authorization
    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

/**
 * POST /api/payments/refund
 * Request refund for a payment
 */
router.post('/refund', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { paymentId, bookingId, reason } = req.body;
    const userId = (req as any).userId;

    // Verify booking belongs to user
    const bookingResult = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Process refund via Razorpay
    const refund = await razorpay.payments.refund(paymentId, {
      amount: undefined,
      notes: { reason: reason || 'Booking cancellation' }
    });

    // Update booking status
    await db.query(
      `UPDATE bookings 
       SET status = $1, payment_status = $2, updated_at = NOW()
       WHERE id = $3`,
      ['cancelled', 'refunded', bookingId]
    );

    // Log refund
    await db.query(
      `INSERT INTO payment_refunds (booking_id, razorpay_refund_id, amount, reason, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [bookingId, refund.id, refund.amount / 100, reason]
    );

    res.status(200).json({ refundId: refund.id, message: 'Refund processed successfully' });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

export default router;
