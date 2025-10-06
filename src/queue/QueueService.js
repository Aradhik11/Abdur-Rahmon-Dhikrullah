const amqp = require('amqplib');
const logger = require('../utils/logger');

class QueueService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      LEAVE_REQUESTS: 'leave.requests',
      LEAVE_REQUESTS_DLQ: 'leave.requests.dlq'
    };
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.channel = await this.connection.createChannel();
      
      // Setup queues
      await this.setupQueues();
      
      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async setupQueues() {
    // Main queue
    await this.channel.assertQueue(this.queues.LEAVE_REQUESTS, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': this.queues.LEAVE_REQUESTS_DLQ,
        'x-message-ttl': 300000 // 5 minutes
      }
    });

    // Dead letter queue
    await this.channel.assertQueue(this.queues.LEAVE_REQUESTS_DLQ, {
      durable: true
    });
  }

  async publishLeaveRequest(data) {
    if (!this.channel) {
      await this.connect();
    }

    const message = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });

    return this.channel.sendToQueue(
      this.queues.LEAVE_REQUESTS,
      Buffer.from(message),
      { persistent: true }
    );
  }

  async consumeLeaveRequests(processor) {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel.prefetch(1);
    
    return this.channel.consume(this.queues.LEAVE_REQUESTS, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await processor(data);
          this.channel.ack(msg);
        } catch (error) {
          logger.error('Error processing leave request:', error);
          this.channel.nack(msg, false, false); // Send to DLQ
        }
      }
    });
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

module.exports = new QueueService();