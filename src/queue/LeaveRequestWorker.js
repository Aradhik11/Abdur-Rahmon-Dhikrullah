const QueueService = require('./QueueService');
const LeaveRequestService = require('../services/LeaveRequestService');
const logger = require('../utils/logger');

class LeaveRequestWorker {
  constructor() {
    this.retryStrategies = {
      exponential: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 30000),
      linear: (retryCount) => Math.min(1000 * retryCount, 10000),
      fixed: () => 5000
    };
  }

  async start() {
    try {
      await QueueService.connect();
      await QueueService.consumeLeaveRequests(this.processLeaveRequest.bind(this));
      logger.info('Leave request worker started');
    } catch (error) {
      logger.error('Failed to start leave request worker:', error);
      throw error;
    }
  }

  async processLeaveRequest(data) {
    const { leaveRequestId, retryCount = 0 } = data;
    
    try {
      // Idempotency check - verify request hasn't been processed
      const existingRequest = await require('../repositories/LeaveRequestRepository').findById(leaveRequestId);
      
      if (!existingRequest) {
        logger.warn(`Leave request ${leaveRequestId} not found`);
        return;
      }

      if (existingRequest.processedAt) {
        logger.info(`Leave request ${leaveRequestId} already processed`);
        return;
      }

      const result = await LeaveRequestService.processLeaveRequest(data);
      
      logger.info(`Processed leave request ${leaveRequestId}:`, result);
    } catch (error) {
      logger.error(`Error processing leave request ${leaveRequestId}:`, error);
      
      if (retryCount < 3) {
        await this.retryWithBackoff(data, retryCount + 1);
      } else {
        logger.error(`Max retries exceeded for leave request ${leaveRequestId}`);
        throw error;
      }
    }
  }

  async retryWithBackoff(data, retryCount) {
    const delay = this.retryStrategies.exponential(retryCount);
    
    setTimeout(async () => {
      try {
        await QueueService.publishLeaveRequest({
          ...data,
          retryCount
        });
      } catch (error) {
        logger.error('Failed to retry leave request:', error);
      }
    }, delay);
  }

  async stop() {
    await QueueService.close();
    logger.info('Leave request worker stopped');
  }
}

module.exports = new LeaveRequestWorker();