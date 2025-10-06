const LeaveRequestService = require('../../src/services/LeaveRequestService');

describe('LeaveRequestService', () => {
  describe('calculateLeaveDays', () => {
    it('should calculate leave days correctly for single day', () => {
      const startDate = '2024-01-15';
      const endDate = '2024-01-15';
      
      const days = LeaveRequestService.calculateLeaveDays(startDate, endDate);
      
      expect(days).toBe(1);
    });

    it('should calculate leave days correctly for multiple days', () => {
      const startDate = '2024-01-15';
      const endDate = '2024-01-17';
      
      const days = LeaveRequestService.calculateLeaveDays(startDate, endDate);
      
      expect(days).toBe(3);
    });
  });

  describe('processLeaveRequest', () => {
    it('should auto-approve leaves <= 2 days', async () => {
      const leaveRequestData = {
        leaveRequestId: 1,
        startDate: '2024-01-15',
        endDate: '2024-01-16'
      };

      // Mock the repository
      const mockUpdateStatus = jest.fn();
      jest.doMock('../../src/repositories/LeaveRequestRepository', () => ({
        updateStatus: mockUpdateStatus
      }));

      const result = await LeaveRequestService.processLeaveRequest(leaveRequestData);

      expect(result.status).toBe('APPROVED');
      expect(result.leaveDays).toBe(2);
    });

    it('should mark leaves > 2 days as PENDING_APPROVAL', async () => {
      const leaveRequestData = {
        leaveRequestId: 1,
        startDate: '2024-01-15',
        endDate: '2024-01-18'
      };

      const result = await LeaveRequestService.processLeaveRequest(leaveRequestData);

      expect(result.status).toBe('PENDING_APPROVAL');
      expect(result.leaveDays).toBe(4);
    });
  });
});