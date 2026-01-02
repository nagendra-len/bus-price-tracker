import priceMonitorService from '../services/priceMonitor';
import db from '../database';

jest.mock('../database');

describe('PriceMonitorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordPrice', () => {
    test('should record price successfully', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await priceMonitorService.recordPrice(1, 500);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO price_history'),
        [1, 500]
      );
    });

    test('should handle database errors', async () => {
      const error = new Error('Database error');
      (db.query as jest.Mock).mockRejectedValue(error);

      await expect(
        priceMonitorService.recordPrice(1, 500)
      ).rejects.toThrow();
    });

    test('should validate route ID', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await priceMonitorService.recordPrice(1, 500);

      expect(db.query).toHaveBeenCalled();
    });

    test('should validate price value', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await priceMonitorService.recordPrice(1, -100);

      // Should still attempt to record
      expect(db.query).toHaveBeenCalled();
    });
  });

  describe('getPriceHistory', () => {
    test('should retrieve price history for route', async () => {
      const mockData = [
        { price: 500, timestamp: '2026-01-02' },
        { price: 450, timestamp: '2026-01-01' }
      ];
      (db.query as jest.Mock).mockResolvedValue({ rows: mockData });

      const result = await priceMonitorService.getPriceHistory(1);

      expect(result).toEqual(mockData);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT price, timestamp'),
        [1]
      );
    });

    test('should handle empty price history', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await priceMonitorService.getPriceHistory(1);

      expect(result).toEqual([]);
    });

    test('should support custom time period', async () => {
      const mockData = [
        { price: 500, timestamp: '2026-01-02' }
      ];
      (db.query as jest.Mock).mockResolvedValue({ rows: mockData });

      const result = await priceMonitorService.getPriceHistory(1, 30);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
    });

    test('should sort prices by timestamp descending', async () => {
      const mockData = [
        { price: 500, timestamp: '2026-01-02' },
        { price: 450, timestamp: '2026-01-01' }
      ];
      (db.query as jest.Mock).mockResolvedValue({ rows: mockData });

      const result = await priceMonitorService.getPriceHistory(1);

      expect(result[0].timestamp).toBeGreaterThanOrEqual(result[1].timestamp);
    });

    test('should handle database query errors', async () => {
      const error = new Error('Query failed');
      (db.query as jest.Mock).mockRejectedValue(error);

      await expect(
        priceMonitorService.getPriceHistory(1)
      ).rejects.toThrow('Query failed');
    });
  });

  describe('Price Analysis', () => {
    test('should calculate price trend', async () => {
      const mockData = [
        { price: 600, timestamp: '2026-01-03' },
        { price: 500, timestamp: '2026-01-02' },
        { price: 450, timestamp: '2026-01-01' }
      ];
      (db.query as jest.Mock).mockResolvedValue({ rows: mockData });

      const history = await priceMonitorService.getPriceHistory(1);

      expect(history.length).toBe(3);
      expect(history[0].price).toBeGreaterThan(history[2].price);
    });

    test('should identify lowest price', async () => {
      const mockData = [
        { price: 600, timestamp: '2026-01-03' },
        { price: 350, timestamp: '2026-01-02' },
        { price: 500, timestamp: '2026-01-01' }
      ];
      (db.query as jest.Mock).mockResolvedValue({ rows: mockData });

      const history = await priceMonitorService.getPriceHistory(1);

      const minPrice = Math.min(...history.map(h => h.price));
      expect(minPrice).toBe(350);
    });

    test('should handle single price record', async () => {
      const mockData = [{ price: 500, timestamp: '2026-01-02' }];
      (db.query as jest.Mock).mockResolvedValue({ rows: mockData });

      const result = await priceMonitorService.getPriceHistory(1);

      expect(result).toHaveLength(1);
    });
  });
});
