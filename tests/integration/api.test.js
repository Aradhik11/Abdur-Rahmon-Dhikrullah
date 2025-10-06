const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/database/config');

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/departments', () => {
    it('should create a new department', async () => {
      const departmentData = {
        name: 'Engineering'
      };

      const response = await request(app)
        .post('/api/departments')
        .send(departmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Engineering');
    });

    it('should return validation error for empty name', async () => {
      const response = await request(app)
        .post('/api/departments')
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/employees', () => {
    let departmentId;

    beforeEach(async () => {
      const dept = await request(app)
        .post('/api/departments')
        .send({ name: 'HR' });
      departmentId = dept.body.data.id;
    });

    it('should create a new employee', async () => {
      const employeeData = {
        name: 'John Doe',
        email: 'john@example.com',
        departmentId
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
    });

    it('should return error for duplicate email', async () => {
      const employeeData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        departmentId
      };

      await request(app)
        .post('/api/employees')
        .send(employeeData);

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service is healthy');
    });
  });
});