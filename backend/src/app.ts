import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import alertsRouter from './routes/alerts';
import bookingRouter from './routes/booking';
import notificationsRouter from './routes/notifications';
import travelerRouter from './routes/traveler.routes';
import paymentsRouter from './routes/payments.routes';
import busOperatorRouter from './routes/busOperator.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRouter);
app.use('/alerts', alertsRouter);
app.use('/bookings', bookingRouter);
app.use('/notifications', notificationsRouter);
app.use('/travelers', travelerRouter);
app.use('/payments', paymentsRouter);
app.use('/bus-operators', busOperatorRouter);
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Bus Price Tracker API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;
