const express = require('express');
const rateLimit = require('express-rate-limit');
const DepartmentController = require('../controllers/DepartmentController');
const EmployeeController = require('../controllers/EmployeeController');
const LeaveRequestController = require('../controllers/LeaveRequestController');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});

router.use(limiter);

// Department routes
router.post('/departments', validate(schemas.createDepartment), DepartmentController.createDepartment);
router.get('/departments/:id/employees', DepartmentController.getDepartmentEmployees);

// Employee routes
router.post('/employees', validate(schemas.createEmployee), EmployeeController.createEmployee);
router.get('/employees/:id', EmployeeController.getEmployee);

// Leave request routes
router.post('/leave-requests', validate(schemas.createLeaveRequest), LeaveRequestController.createLeaveRequest);

// Health check
router.get('/health', async (req, res) => {
  try {
    // Check database
    await require('../database/config').authenticate();
    
    // Check queue (basic connection test)
    const QueueService = require('../queue/QueueService');
    const queueHealthy = QueueService.connection && !QueueService.connection.connection.destroyed;
    
    res.json({
      success: true,
      message: 'Service is healthy',
      checks: {
        database: 'healthy',
        queue: queueHealthy ? 'healthy' : 'unhealthy'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service is unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Queue health check
router.get('/queue-health', async (req, res) => {
  try {
    const QueueService = require('../queue/QueueService');
    const isHealthy = QueueService.connection && !QueueService.connection.connection.destroyed;
    
    if (isHealthy) {
      res.json({
        success: true,
        message: 'Queue is healthy',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Queue is unhealthy',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Queue health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;