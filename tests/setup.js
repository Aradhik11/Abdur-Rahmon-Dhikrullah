// Test setup file
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'workforce_management_test';

// Suppress console logs during tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}