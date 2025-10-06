const EmployeeRepository = require('../repositories/EmployeeRepository');
const DepartmentRepository = require('../repositories/DepartmentRepository');
const { ValidationError } = require('../utils/errors');

class EmployeeService {
  async createEmployee(employeeData) {
    const { name, email, departmentId } = employeeData;
    
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Employee name is required');
    }
    
    if (!email || !this.isValidEmail(email)) {
      throw new ValidationError('Valid email is required');
    }
    
    if (!departmentId || isNaN(departmentId)) {
      throw new ValidationError('Valid department ID is required');
    }

    // Check if department exists
    const department = await DepartmentRepository.findById(departmentId);
    if (!department) {
      throw new ValidationError('Department not found');
    }

    // Check if email already exists
    const existingEmployee = await EmployeeRepository.findByEmail(email);
    if (existingEmployee) {
      throw new ValidationError('Employee with this email already exists');
    }

    return await EmployeeRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      departmentId: parseInt(departmentId)
    });
  }

  async getEmployeeWithLeaveHistory(id) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid employee ID is required');
    }

    const employee = await EmployeeRepository.findByIdWithLeaveHistory(id);
    
    if (!employee) {
      throw new ValidationError('Employee not found');
    }

    return employee;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new EmployeeService();