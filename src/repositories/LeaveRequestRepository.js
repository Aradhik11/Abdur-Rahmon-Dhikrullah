const { LeaveRequest, Employee } = require('../models');

class LeaveRequestRepository {
  async create(leaveRequestData) {
    return await LeaveRequest.create(leaveRequestData);
  }

  async findById(id) {
    return await LeaveRequest.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'email']
      }]
    });
  }

  async updateStatus(id, status, processedAt = new Date()) {
    return await LeaveRequest.update(
      { status, processedAt },
      { where: { id } }
    );
  }

  async findByEmployee(employeeId) {
    return await LeaveRequest.findAll({
      where: { employeeId },
      order: [['createdAt', 'DESC']]
    });
  }

  async findPendingRequests() {
    return await LeaveRequest.findAll({
      where: { status: 'PENDING' },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });
  }
}

module.exports = new LeaveRequestRepository();