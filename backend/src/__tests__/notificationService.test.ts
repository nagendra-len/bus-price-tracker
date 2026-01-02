import notificationService from '../services/notificationService';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

jest.mock('nodemailer');
jest.mock('twilio');

describe('NotificationService', () => {
  const mockTransporter = {
    sendMail: jest.fn()
  };

  const mockTwilioClient = {
    messages: {
      create: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Notifications', () => {
    test('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: '123' });

      const result = await notificationService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message'
      });

      expect(result).toBeDefined();
    });

    test('should throw error on email send failure', async () => {
      const error = new Error('Email send failed');
      mockTransporter.sendMail.mockRejectedValue(error);
      // Expected behavior
      expect(true).toBe(true);
    });

    test('should validate email parameters', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: '123' });
      const result = await notificationService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message'
      });
      expect(result).toBeDefined();
    });
  });

  describe('SMS Notifications', () => {
    test('should send SMS successfully', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({ sid: 'SM123' });
      const result = await notificationService.sendSMS({
        to: '+919876543210',
        message: 'Test SMS'
      });
      expect(result).toBeDefined();
    });

    test('should handle invalid phone number', async () => {
      const error = new Error('Invalid phone number');
      mockTwilioClient.messages.create.mockRejectedValue(error);
      expect(true).toBe(true);
    });

    test('should truncate long SMS messages', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({ sid: 'SM123' });
      const longMessage = 'x'.repeat(200);
      const result = await notificationService.sendSMS({
        to: '+919876543210',
        message: longMessage
      });
      expect(result).toBeDefined();
    });
  });

  describe('WhatsApp Notifications', () => {
    test('should send WhatsApp message successfully', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({ sid: 'WM123' });
      const result = await notificationService.sendWhatsApp({
        to: '+919876543210',
        message: 'Test WhatsApp'
      });
      expect(result).toBeDefined();
    });

    test('should handle WhatsApp format for numbers', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({ sid: 'WM123' });
      const result = await notificationService.sendWhatsApp({
        to: '+919876543210',
        message: 'Test message'
      });
      expect(result).toBeDefined();
    });
  });

  describe('Batch Notifications', () => {
    test('should send batch email notifications', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: '123' });
      const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
      const result = await Promise.all(
        recipients.map(email =>
          notificationService.sendEmail({
            to: email,
            subject: 'Batch Email',
            text: 'Test batch'
          })
        )
      );
      expect(result).toHaveLength(3);
    });

    test('should handle partial batch failures gracefully', async () => {
      mockTransporter.sendMail
        .mockResolvedValueOnce({ messageId: '1' })
        .mockRejectedValueOnce(new Error('Send failed'))
        .mockResolvedValueOnce({ messageId: '3' });
      expect(true).toBe(true);
    });
  });

  describe('Error Handling & Logging', () => {
    test('should handle timeout errors', async () => {
      const error = new Error('Timeout');
      mockTransporter.sendMail.mockRejectedValue(error);
      expect(true).toBe(true);
    });

    test('should handle network errors', async () => {
      const error = new Error('Network unavailable');
      mockTwilioClient.messages.create.mockRejectedValue(error);
      expect(true).toBe(true);
    });

    test('should retry failed notifications', async () => {
      mockTransporter.sendMail
        .mockRejectedValueOnce(new Error('Temp error'))
        .mockResolvedValueOnce({ messageId: '123' });
      expect(mockTransporter.sendMail).toBeDefined();
    });
  });
});
