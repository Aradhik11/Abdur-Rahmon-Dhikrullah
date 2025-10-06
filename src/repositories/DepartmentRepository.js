const { Department, Employee } = require('../models');

class DepartmentRepository {
  async create(departmentData) {
    return await Department.create(departmentData);
  }

  async findById(id) {
    return await Department.findByPk(id);
  }

  async findByIdWithEmployees(id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return await Department.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employees',
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      }]
    });
  }

  async getEmployeeCount(departmentId) {
    return await Employee.count({
      where: { departmentId }
    });
  }
}

module.exports = new DepartmentRepository();