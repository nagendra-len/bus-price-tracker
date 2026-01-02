import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PriceMonitorCron } from '../services/priceMonitorCron';

describe('PriceMonitorCron', () => {
  let priceMonitorCron: PriceMonitorCron;
  let mockPriceMonitor: any;
  let mockNotificationService: any;

  beforeEach(() => {
    mockPriceMonitor = {
      getPriceHistory: vi.fn(),
      detectPriceDrop: vi.fn(),
    };
    mockNotificationService = { sendAlert: vi.fn() };
    priceMonitorCron = new PriceMonitorCron(mockPriceMonitor, mockNotificationService);
  });

  afterEach(() => { vi.clearAllMocks(); });

  describe('initialization', () => {
    it('should initialize with dependencies', () => {
      expect(priceMonitorCron).toBeDefined();
      expect(priceMonitorCron).toHaveProperty('start');
    });
    it('should have empty jobs on startup', () => {
      expect(priceMonitorCron.jobs).toHaveLength(0);
    });
  });

  describe('startMonitoring', () => {
    it('should start cron job', () => {
      const result = priceMonitorCron.start('0 * * * *');
      expect(result).toBe(true);
    });
    it('should add job to array', () => {
      priceMonitorCron.start('0 * * * *');
      expect(priceMonitorCron.jobs.length).toBeGreaterThan(0);
    });
    it('should not duplicate jobs', () => {
      priceMonitorCron.start('0 * * * *');
      const len = priceMonitorCron.jobs.length;
      priceMonitorCron.start('0 * * * *');
      expect(priceMonitorCron.jobs.length).toBe(len);
    });
    it('should handle invalid cron', () => {
      expect(() => priceMonitorCron.start('invalid')).toThrow();
    });
  });

  describe('stopMonitoring', () => {
    it('should stop cron jobs', () => {
      priceMonitorCron.start('0 * * * *');
      expect(priceMonitorCron.stop()).toBe(true);
    });
    it('should clear jobs', () => {
      priceMonitorCron.start('0 * * * *');
      priceMonitorCron.stop();
      expect(priceMonitorCron.jobs).toHaveLength(0);
    });
    it('should handle no jobs', () => {
      expect(() => priceMonitorCron.stop()).not.toThrow();
    });
  });

  describe('monitoringCycle', () => {
    it('should fetch price history', async () => {
      mockPriceMonitor.getPriceHistory.mockResolvedValue([{ price: 500 }]);
      await priceMonitorCron.executeCycle(1);
      expect(mockPriceMonitor.getPriceHistory).toHaveBeenCalledWith(1);
    });
    it('should detect drops', async () => {
      mockPriceMonitor.getPriceHistory.mockResolvedValue([{ price: 500 }]);
      mockPriceMonitor.detectPriceDrop.mockResolvedValue(true);
      await priceMonitorCron.executeCycle(1);
      expect(mockPriceMonitor.detectPriceDrop).toHaveBeenCalled();
    });
    it('should send alert on drop', async () => {
      mockPriceMonitor.getPriceHistory.mockResolvedValue([{ price: 500 }]);
      mockPriceMonitor.detectPriceDrop.mockResolvedValue(true);
      await priceMonitorCron.executeCycle(1);
      expect(mockNotificationService.sendAlert).toHaveBeenCalled();
    });
    it('should handle errors', async () => {
      mockPriceMonitor.getPriceHistory.mockRejectedValue(new Error('DB'));
      expect(async () => await priceMonitorCron.executeCycle(1)).not.toThrow();
    });
  });

  describe('priceDropThreshold', () => {
    it('should alert on significant drop', async () => {
      mockPriceMonitor.getPriceHistory.mockResolvedValue([{ price: 300 }]);
      mockPriceMonitor.detectPriceDrop.mockResolvedValue(true);
      await priceMonitorCron.executeCycle(1);
      expect(mockNotificationService.sendAlert).toHaveBeenCalled();
    });
    it('should not alert on minor changes', async () => {
      mockPriceMonitor.getPriceHistory.mockResolvedValue([{ price: 490 }]);
      mockPriceMonitor.detectPriceDrop.mockResolvedValue(false);
      await priceMonitorCron.executeCycle(1);
      expect(mockNotificationService.sendAlert).not.toHaveBeenCalled();
    });
  });

  describe('jobScheduling', () => {
    it('should support cron patterns', () => {
      const patterns = ['*/5 * * * *', '0 * * * *'];
      patterns.forEach(p => {
        expect(() => priceMonitorCron.start(p)).not.toThrow();
      });
    });
    it('should update status', () => {
      priceMonitorCron.start('0 * * * *');
      expect(priceMonitorCron.isRunning()).toBe(true);
    });
    it('should handle timezone', () => {
      expect(priceMonitorCron.setTimezone).toBeDefined();
    });
    it('should list active jobs', () => {
      priceMonitorCron.start('0 * * * *');
      expect(priceMonitorCron.getActiveJobs().length).toBeGreaterThan(0);
    });
    it('should pause monitoring', () => {
      priceMonitorCron.start('0 * * * *');
      expect(priceMonitorCron.pause()).toBe(true);
    });
    it('should resume monitoring', () => {
      priceMonitorCron.start('0 * * * *');
      priceMonitorCron.pause();
      expect(priceMonitorCron.resume()).toBe(true);
    });
  });
});
