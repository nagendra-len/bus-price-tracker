import request from 'supertest';
import app from './app';
import db from './database';
import jwt from 'jsonwebtoken';

describe('Bus Price Tracker - Integration Tests', () => {
  let authToken: string;
  let testUserId: number;
  let testRouteId: number;

  beforeAll(async () => {
    console.log('Setting up integration tests...');
  });

  afterAll(async () => {
    await db.end();
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register - Register with email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });
  });

  describe('Routes Endpoints', () => {
    test('GET /api/routes - Get all routes', async () => {
      const response = await request(app)
        .get('/api/routes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Price Alert Endpoints', () => {
    test('POST /api/alerts - Create alert', async () => {
      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routeId: 1,
          targetPrice: 500,
          notificationType: ['email']
        });

      expect([200, 201]).toContain(response.status);
    });
  });

  describe('Booking Endpoints', () => {
    test('POST /api/bookings - Create booking', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routeId: 1,
          seats: [1, 2],
          totalPrice: 1000
        });

      expect([200, 201]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    test('Request without token should return 401', async () => {
      const response = await request(app)
        .get('/api/alerts');

      expect(response.status).toBe(401);
    });
  });
});
