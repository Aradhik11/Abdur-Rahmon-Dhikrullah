const LeaveRequestService = require('../services/LeaveRequestService');
const { successResponse } = require('../utils/responseWrapper');

class LeaveRequestController {
  async createLeaveRequest(req, res, next) {
    try {
      const leaveRequest = await LeaveRequestService.createLeaveRequest(req.body);
      res.status(201).json(successResponse(
        leaveRequest, 
        'Leave request created and queued for processing', 
        201
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeaveRequestController();