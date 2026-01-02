import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Bus Price Tracker API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;
