const DepartmentService = require('../services/DepartmentService');
const { successResponse, paginatedResponse } = require('../utils/responseWrapper');

class DepartmentController {
  async createDepartment(req, res, next) {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      res.status(201).json(successResponse(department, 'Department created successfully', 201));
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentEmployees(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await DepartmentService.getDepartmentWithEmployees(id, page, limit);
      
      res.json(paginatedResponse(
        result.department,
        result.pagination,
        'Department employees retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartmentController();