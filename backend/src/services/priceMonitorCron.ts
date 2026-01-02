import cron from 'node-cron';
import db from '../database';
import priceMonitorService from './priceMonitor';
import notificationService from './notificationService';

/**
 * Price Monitor Cron Job Setup
 * Runs every 30 minutes to check for price changes
 */

class PriceMonitorCron {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Start the cron job for price monitoring
   */
  start(): void {
    console.log('Starting Price Monitor Cron Job...');
    
    // Run every 30 minutes: '*/30 * * * *'
    this.cronJob = cron.schedule('*/30 * * * *', async () => {
      try {
        console.log('[Cron] Running price monitoring check...');
        await this.checkPricesAndTriggerAlerts();
      } catch (error) {
        console.error('[Cron] Error in price monitoring:', error);
      }
    });

    console.log('Price Monitor Cron Job started successfully!');
  }

  /**
   * Stop the cron job
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Price Monitor Cron Job stopped');
    }
  }

  /**
   * Check prices for all active routes and trigger alerts
   */
  private async checkPricesAndTriggerAlerts(): Promise<void> {
    try {
      // Get all active routes
      const routesResult = await db.query(
        'SELECT id, departure_city, destination_city, current_price FROM routes WHERE active = true'
      );

      const routes = routesResult.rows;
      console.log(`[Cron] Checking prices for ${routes.length} active routes`);

      for (const route of routes) {
        await this.checkRoutePrice(route);
      }
    } catch (error) {
      console.error('[Cron] Error checking prices:', error);
      throw error;
    }
  }

  /**
   * Check price for a specific route and trigger alerts if needed
   */
  private async checkRoutePrice(route: any): Promise<void> {
    try {
      const { id: routeId, current_price, departure_city, destination_city } = route;

      // Get all active alerts for this route
      const alertsResult = await db.query(
        `SELECT a.id, a.user_id, a.target_price, a.notification_type, u.email, u.phone
         FROM alerts a
         JOIN users u ON a.user_id = u.id
         WHERE a.route_id = $1 AND a.is_active = true`,
        [routeId]
      );

      const alerts = alertsResult.rows;

      if (alerts.length === 0) {
        return;
      }

      // Check if current price is lower than target price
      for (const alert of alerts) {
        if (current_price <= alert.target_price) {
          console.log(`[Cron] Alert triggered for user ${alert.user_id}: Route ${routeId}`);
          await this.sendAlertNotifications(alert, current_price, route);
          
          // Mark alert as triggered
          await this.markAlertAsTriggered(alert.id);
        }
      }
    } catch (error) {
      console.error(`[Cron] Error checking route price ${route.id}:`, error);
    }
  }

  /**
   * Send notifications through all configured channels
   */
  private async sendAlertNotifications(alert: any, currentPrice: number, route: any): Promise<void> {
    const { user_id, email, phone, notification_type, target_price } = alert;
    const { departure_city, destination_city } = route;

    const message = `Price Alert! Route ${departure_city} to ${destination_city} price dropped to ₹${currentPrice} (Target was ₹${target_price})`;
    const emailSubject = 'Price Alert - Bus Fare Dropped!';

    try {
      const notificationType = JSON.parse(notification_type);

      // Send email notification
      if (notificationType.includes('email') && email) {
        await notificationService.sendEmail({
          to: email,
          subject: emailSubject,
          text: message,
          html: `<p>${message}</p><p><a href="https://app.buspricetracker.com/route/${route.id}">Book Now</a></p>`
        });
      }

      // Send SMS notification
      if (notificationType.includes('sms') && phone) {
        await notificationService.sendSMS({
          to: phone,
          message: message
        });
      }

      // Send WhatsApp notification
      if (notificationType.includes('whatsapp') && phone) {
        await notificationService.sendWhatsApp({
          to: phone,
          message: message
        });
      }

      console.log(`[Cron] Notifications sent for alert ${alert.id}`);
    } catch (error) {
      console.error(`[Cron] Error sending notifications for alert ${alert.id}:`, error);
    }
  }

  /**
   * Mark alert as triggered and disable it if needed
   */
  private async markAlertAsTriggered(alertId: number): Promise<void> {
    try {
      await db.query(
        `UPDATE alerts 
         SET triggered_at = NOW(), 
             trigger_count = trigger_count + 1
         WHERE id = $1`,
        [alertId]
      );

      // Optionally disable alert after first trigger
      // await db.query(
      //   'UPDATE alerts SET is_active = false WHERE id = $1',
      //   [alertId]
      // );
    } catch (error) {
      console.error(`[Cron] Error updating alert ${alertId}:`, error);
    }
  }

  /**
   * Get cron job status
   */
  getStatus(): { running: boolean; lastRun?: Date } {
    return {
      running: this.cronJob ? !this.cronJob._destroyed : false
    };
  }
}

export default new PriceMonitorCron();
