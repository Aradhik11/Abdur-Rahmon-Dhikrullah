const DepartmentRepository = require('../repositories/DepartmentRepository');
const { ValidationError } = require('../utils/errors');

class DepartmentService {
  async createDepartment(departmentData) {
    const { name } = departmentData;
    
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Department name is required');
    }

    return await DepartmentRepository.create({ name: name.trim() });
  }

  async getDepartmentWithEmployees(id, page = 1, limit = 10) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid department ID is required');
    }

    const department = await DepartmentRepository.findByIdWithEmployees(id, page, limit);
    
    if (!department) {
      throw new ValidationError('Department not found');
    }

    const totalEmployees = await DepartmentRepository.getEmployeeCount(id);
    const totalPages = Math.ceil(totalEmployees / limit);

    return {
      department,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEmployees,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}

module.exports = new DepartmentService();