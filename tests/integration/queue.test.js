const QueueService = require('../../src/queue/QueueService');
const LeaveRequestService = require('../../src/services/LeaveRequestService');

// Mock RabbitMQ for testing
jest.mock('amqplib', () => ({
  connect: jest.fn(() => Promise.resolve({
    createChannel: jest.fn(() => Promise.resolve({
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(() => true),
      consume: jest.fn(),
      prefetch: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn()
    })),
    close: jest.fn()
  }))
}));

describe('Queue Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('QueueService', () => {
    it('should publish leave request to queue', async () => {
      const leaveRequestData = {
        leaveRequestId: 1,
        employeeId: 1,
        startDate: '2024-01-15',
        endDate: '2024-01-16'
      };

      await QueueService.connect();
      const result = await QueueService.publishLeaveRequest(leaveRequestData);

      expect(result).toBe(true);
    });

    it('should setup queues with dead letter configuration', async () => {
      await QueueService.connect();
      
      // Verify that setupQueues was called during connect
      expect(QueueService.channel.assertQueue).toHaveBeenCalledWith(
        'leave.requests',
        expect.objectContaining({
          durable: true,
          arguments: expect.objectContaining({
            'x-dead-letter-routing-key': 'leave.requests.dlq'
          })
        })
      );
    });
  });

  describe('Leave Request Processing', () => {
    it('should process leave request with correct business logic', async () => {
      const leaveRequestData = {
        leaveRequestId: 1,
        startDate: '2024-01-15',
        endDate: '2024-01-16'
      };

      // Mock repository method
      const mockUpdateStatus = jest.fn();
      jest.doMock('../../src/repositories/LeaveRequestRepository', () => ({
        updateStatus: mockUpdateStatus
      }));

      const result = await LeaveRequestService.processLeaveRequest(leaveRequestData);

      expect(result.status).toBe('APPROVED');
      expect(result.leaveDays).toBe(2);
    });
  });
});