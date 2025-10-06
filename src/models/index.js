const Department = require('./Department');
const Employee = require('./Employee');
const LeaveRequest = require('./LeaveRequest');

// Define associations
Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

module.exports = {
  Department,
  Employee,
  LeaveRequest
};