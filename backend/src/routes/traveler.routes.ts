import { Router, Request, Response } from 'express';
import travelerDataCollector from '../services/travelerDataCollector';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// GET /api/travelers/data - Real-time aggregated price data
router.get('/data', (req: Request, res: Response) => {
  try {
    const allData = travelerDataCollector.getAllRouteData();
    const dataArray = Array.from(allData.entries()).map(([route, data]) => ({
      route,
      ...data,
    }));

    res.json({
      success: true,
      message: 'Real-time traveler data retrieved',
      data: dataArray,
      timestamp: new Date(),
      activeTravelersCount: travelerDataCollector.getActiveTravelersCount(),
    });
  } catch (error) {
    console.error('Error retrieving traveler data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve traveler data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/travelers/route/:busRoute - Get data for specific route
router.get('/route/:busRoute', (req: Request, res: Response) => {
  try {
    const { busRoute } = req.params;
    const routeData = travelerDataCollector.getRouteData(busRoute);

    if (!routeData) {
      return res.status(404).json({
        success: false,
        message: `No active data for route: ${busRoute}`,
      });
    }

    res.json({
      success: true,
      message: `Real-time data for route ${busRoute}`,
      data: routeData,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error retrieving route data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve route data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/travelers/stats - Overall traveler statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const allData = travelerDataCollector.getAllRouteData();
    const routes = Array.from(allData.keys());
    const activeTravelersCount = travelerDataCollector.getActiveTravelersCount();

    let totalPrice = 0;
    let totalTravelers = 0;

    allData.forEach((data) => {
      totalPrice += data.averagePrice * data.travelerCount;
      totalTravelers += data.travelerCount;
    });

    const overallAveragePrice = totalTravelers > 0 ? Math.round(totalPrice / totalTravelers) : 0;

    res.json({
      success: true,
      message: 'Traveler statistics retrieved',
      stats: {
        activeTravelersCount,
        activeRoutes: routes.length,
        routes,
        overallAveragePrice,
        totalDataPoints: totalTravelers,
        collectionTimestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error retrieving traveler stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve traveler statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/travelers/active-count - Count of active travelers
router.get('/active-count', (req: Request, res: Response) => {
  try {
    const count = travelerDataCollector.getActiveTravelersCount();
    res.json({
      success: true,
      message: 'Active travelers count retrieved',
      activeTravelersCount: count,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error retrieving active count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active travelers count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/travelers/price-trend/:busRoute - Price trend data
router.get('/price-trend/:busRoute', (req: Request, res: Response) => {
  try {
    const { busRoute } = req.params;
    const routeData = travelerDataCollector.getRouteData(busRoute);

    if (!routeData) {
      return res.status(404).json({
        success: false,
        message: `No data available for route: ${busRoute}`,
      });
    }

    res.json({
      success: true,
      message: `Price trend for route ${busRoute}`,
      data: {
        route: busRoute,
        currentPrice: routeData.averagePrice,
        minPrice: routeData.minPrice,
        maxPrice: routeData.maxPrice,
        priceHistory: routeData.priceHistory,
        travelerCount: routeData.travelerCount,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error retrieving price trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve price trend',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/travelers/operators/:busRoute - Popular bus operators
router.get('/operators/:busRoute', (req: Request, res: Response) => {
  try {
    const { busRoute } = req.params;
    const routeData = travelerDataCollector.getRouteData(busRoute);

    if (!routeData) {
      return res.status(404).json({
        success: false,
        message: `No data available for route: ${busRoute}`,
      });
    }

    res.json({
      success: true,
      message: `Bus operators for route ${busRoute}`,
      data: {
        route: busRoute,
        commonOperators: routeData.commonOperators,
        totalTravelers: routeData.travelerCount,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error retrieving operators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve operators data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/travelers/subscribe - Subscribe to real-time updates
router.post('/subscribe', authenticateToken, (req: Request, res: Response) => {
  try {
    const { routes } = req.body;

    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Routes array is required',
      });
    }

    res.json({
      success: true,
      message: 'Subscription successful',
      subscribedRoutes: routes,
      note: 'For real-time updates, use WebSocket connection',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error in subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
