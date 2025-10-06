const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseWrapper');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json(errorResponse(err.message, 400));
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json(errorResponse(err.message, 404));
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json(errorResponse('Validation failed', 400, errors));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json(errorResponse('Resource already exists', 409));
  }

  // Default server error
  res.status(500).json(errorResponse('Internal server error', 500));
};

module.exports = errorHandler;