const { Employee, Department, LeaveRequest } = require('../models');
const cache = require('../utils/cache');

class EmployeeRepository {
  async create(employeeData) {
    return await Employee.create(employeeData);
  }

  async findById(id) {
    return await Employee.findByPk(id);
  }

  async findByIdWithLeaveHistory(id) {
    const cacheKey = `employee:${id}:with-leave-history`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: LeaveRequest,
          as: 'leaveRequests',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (employee) {
      cache.set(cacheKey, employee);
    }

    return employee;
  }

  async findByEmail(email) {
    return await Employee.findOne({ where: { email } });
  }

  async findByDepartment(departmentId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return await Employee.findAndCountAll({
      where: { departmentId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new EmployeeRepository();