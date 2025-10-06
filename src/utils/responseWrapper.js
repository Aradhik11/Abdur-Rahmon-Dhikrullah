const successResponse = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

const errorResponse = (message, statusCode = 500, errors = null) => ({
  success: false,
  message,
  errors,
  timestamp: new Date().toISOString()
});

const paginatedResponse = (data, pagination, message = 'Success') => ({
  success: true,
  message,
  data,
  pagination,
  timestamp: new Date().toISOString()
});

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};