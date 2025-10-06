const EmployeeService = require('../services/EmployeeService');
const { successResponse } = require('../utils/responseWrapper');

class EmployeeController {
  async createEmployee(req, res, next) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(201).json(successResponse(employee, 'Employee created successfully', 201));
    } catch (error) {
      next(error);
    }
  }

  async getEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await EmployeeService.getEmployeeWithLeaveHistory(id);
      res.json(successResponse(employee, 'Employee retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();