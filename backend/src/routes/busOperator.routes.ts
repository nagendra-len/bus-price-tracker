import express, { Router, Request, Response } from 'express';
import BusOperatorAggregator from '../services/busOperatorAggregator';

const router: Router = express.Router();
const busOperatorAggregator = new BusOperatorAggregator();

// Get all bus operators with their current price data
router.get('/all', async (req: Request, res: Response) => {
  try {
    const operators = await busOperatorAggregator.getAllOperators();
    res.json({
      status: 'success',
      data: operators,
      message: 'Bus operators data retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get specific operator data by ID
router.get('/:operatorId', async (req: Request, res: Response) => {
  try {
    const { operatorId } = req.params;
    const operatorData = await busOperatorAggregator.getOperatorData(operatorId);
    res.json({
      status: 'success',
      data: operatorData,
      message: `Data for operator ${operatorId} retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get routes for a specific operator
router.get('/:operatorId/routes', async (req: Request, res: Response) => {
  try {
    const { operatorId } = req.params;
    const routes = await busOperatorAggregator.getOperatorRoutes(operatorId);
    res.json({
      status: 'success',
      data: routes,
      message: `Routes for operator ${operatorId} retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get live prices for a specific operator
router.get('/:operatorId/prices', async (req: Request, res: Response) => {
  try {
    const { operatorId } = req.params;
    const prices = await busOperatorAggregator.getOperatorPrices(operatorId);
    res.json({
      status: 'success',
      data: prices,
      message: `Live prices for operator ${operatorId} retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Sync operator data from external sources
router.post('/:operatorId/sync', async (req: Request, res: Response) => {
  try {
    const { operatorId } = req.params;
    const result = await busOperatorAggregator.syncOperatorData(operatorId);
    res.json({
      status: 'success',
      data: result,
      message: `Data synced successfully for operator ${operatorId}`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

export default router;
