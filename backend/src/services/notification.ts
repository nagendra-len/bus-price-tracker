// Notification Service for SMS, Email, and WhatsApp
import axios from 'axios';

interface NotificationPayload {
  email?: string;
  phone?: string;
  message: string;
  type: 'sms' | 'email' | 'whatsapp';
  subject?: string;
}

class NotificationService {
  // Send SMS using Twilio
  async sendSMS(phone: string, message: string): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          Body: message,
          From: fromNumber,
          To: phone,
        },
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
        }
      );

      console.log('SMS sent successfully:', response.data.sid);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  // Send Email using SendGrid
  async sendEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;

      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email }],
              subject,
            },
          ],
          from: { email: process.env.SENDGRID_FROM_EMAIL },
          content: [
            {
              type: 'text/html',
              value: message,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Email sent successfully:', response.status);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Send WhatsApp message using Twilio
  async sendWhatsApp(phone: string, message: string): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          Body: message,
          From: `whatsapp:${fromNumber}`,
          To: `whatsapp:${phone}`,
        },
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
        }
      );

      console.log('WhatsApp message sent successfully:', response.data.sid);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  // Send notifications based on preferences
  async sendNotifications(payload: NotificationPayload): Promise<void> {
    try {
      if (payload.type === 'sms' && payload.phone) {
        await this.sendSMS(payload.phone, payload.message);
      } else if (payload.type === 'email' && payload.email) {
        await this.sendEmail(payload.email, payload.subject || 'Notification', payload.message);
      } else if (payload.type === 'whatsapp' && payload.phone) {
        await this.sendWhatsApp(payload.phone, payload.message);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();
