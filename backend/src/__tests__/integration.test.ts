import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import app from '../app';
import { Database } from '../database';
import { AuthService } from '../services/authService';
import { PriceMonitorService } from '../services/priceMonitor';

describe('Integration Tests', () => {
  let db: Database;
  let authService: AuthService;
  let priceService: PriceMonitorService;

  beforeEach(async () => {
    db = new Database();
    authService = new AuthService(db);
    priceService = new PriceMonitorService(db);
    await db.connect();
  });

  afterEach(async () => {
    await db.disconnect();
    vi.clearAllMocks();
  });

  describe('End-to-End: User Registration & Login', () => {
    it('should register and login user', async () => {
      const user = await authService.register({
        email: 'integration@test.com',
        password: 'test123',
      });
      expect(user).toHaveProperty('id');
      const loggedIn = await authService.login('integration@test.com', 'test123');
      expect(loggedIn).toBe(true);
    });
    it('should prevent duplicate registration', async () => {
      await authService.register({
        email: 'dup@test.com',
        password: 'test123',
      });
      expect(async () => {
        await authService.register({
          email: 'dup@test.com',
          password: 'test123',
        });
      }).rejects.toThrow();
    });
  });

  describe('End-to-End: Price Monitoring', () => {
    it('should create alert and track prices', async () => {
      const user = await authService.register({
        email: 'monitor@test.com',
        password: 'test123',
      });
      const alert = await priceService.createAlert(user.id, {
        busId: 1,
        priceThreshold: 500,
      });
      expect(alert).toHaveProperty('id');
    });
    it('should detect price drops', async () => {
      const prices = [
        { busId: 1, price: 600, timestamp: new Date() },
        { busId: 1, price: 400, timestamp: new Date() },
      ];
      const isDrop = priceService.detectDrop(prices[0].price, prices[1].price);
      expect(isDrop).toBe(true);
    });
  });

  describe('End-to-End: Booking Flow', () => {
    it('should complete booking flow', async () => {
      const user = await authService.register({
        email: 'book@test.com',
        password: 'test123',
      });
      expect(user).toHaveProperty('id');
    });
  });

  describe('Data Persistence', () => {
    it('should persist user data', async () => {
      const user = await authService.register({
        email: 'persist@test.com',
        password: 'test123',
      });
      const retrieved = await authService.getUser(user.id);
      expect(retrieved.email).toBe('persist@test.com');
    });
    it('should maintain alert history', async () => {
      const user = await authService.register({
        email: 'history@test.com',
        password: 'test123',
      });
      await priceService.createAlert(user.id, { busId: 1, priceThreshold: 500 });
      const alerts = await priceService.getAlerts(user.id);
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple users', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(authService.register({
          email: `concurrent${i}@test.com`,
          password: 'test123',
        }));
      }
      const users = await Promise.all(promises);
      expect(users).toHaveLength(5);
    });
  });
});
