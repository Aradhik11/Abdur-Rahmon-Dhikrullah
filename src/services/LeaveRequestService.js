const LeaveRequestRepository = require('../repositories/LeaveRequestRepository');
const EmployeeRepository = require('../repositories/EmployeeRepository');
const QueueService = require('../queue/QueueService');
const { ValidationError } = require('../utils/errors');

class LeaveRequestService {
  async createLeaveRequest(leaveRequestData) {
    const { employeeId, startDate, endDate } = leaveRequestData;
    
    if (!employeeId || isNaN(employeeId)) {
      throw new ValidationError('Valid employee ID is required');
    }
    
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      throw new ValidationError('End date must be after start date');
    }
    
    if (start < new Date().setHours(0, 0, 0, 0)) {
      throw new ValidationError('Start date cannot be in the past');
    }

    // Check if employee exists
    const employee = await EmployeeRepository.findById(employeeId);
    if (!employee) {
      throw new ValidationError('Employee not found');
    }

    const leaveRequest = await LeaveRequestRepository.create({
      employeeId: parseInt(employeeId),
      startDate,
      endDate,
      status: 'PENDING'
    });

    // Publish to queue for processing
    await QueueService.publishLeaveRequest({
      leaveRequestId: leaveRequest.id,
      employeeId: leaveRequest.employeeId,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate
    });

    return leaveRequest;
  }

  calculateLeaveDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  async processLeaveRequest(leaveRequestData) {
    const { leaveRequestId, startDate, endDate } = leaveRequestData;
    
    const leaveDays = this.calculateLeaveDays(startDate, endDate);
    let status = 'PENDING_APPROVAL';
    
    // Auto-approve leaves <= 2 days
    if (leaveDays <= 2) {
      status = 'APPROVED';
    }

    await LeaveRequestRepository.updateStatus(leaveRequestId, status);
    
    return { leaveRequestId, status, leaveDays };
  }
}

module.exports = new LeaveRequestService();