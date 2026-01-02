import { Router, Request, Response } from 'express';
import { db } from '../database';
import notificationService from '../services/notification';

const router = Router();

// Save notification preferences
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const { enableSMS, enableEmail, enableWhatsApp } = req.body;

    // Update user's notification preferences
    await db.query(
      'UPDATE users SET notification_preferences = $1 WHERE id = $2',
      [JSON.stringify({ enableSMS, enableEmail, enableWhatsApp }), userId]
    );

    console.log(`Notification preferences updated for user ${userId}`);
    res.status(200).json({
      success: true,
      message: 'Notification preferences saved',
      data: { enableSMS, enableEmail, enableWhatsApp },
    });
  } catch (error: any) {
    console.error('Preferences save error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save notification preferences',
      message: error.message,
    });
  }
});

// Get notification preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    const result = await db.query(
      'SELECT notification_preferences FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0].notification_preferences,
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification preferences',
      message: error.message,
    });
  }
});

// Send notification
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { email, phone, message, type, subject } = req.body;

    await notificationService.sendNotifications({
      email,
      phone,
      message,
      type,
      subject,
    });

    res.status(200).json({
      success: true,
      message: `${type} sent successfully`,
    });
  } catch (error: any) {
    console.error('Notification send error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
      message: error.message,
    });
  }
});

export default router;
