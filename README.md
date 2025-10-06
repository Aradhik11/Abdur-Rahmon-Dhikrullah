# Workforce Management System

A scalable Node.js-based workforce management system built with Express.js, MySQL, and RabbitMQ.

## Features

- **Department Management**: Create and manage departments
- **Employee Management**: Add employees to departments with leave history tracking
- **Leave Request Processing**: Automated leave approval with queue-based processing
- **Scalable Architecture**: Repository pattern, service layer, and message queues
- **Production Ready**: Rate limiting, error handling, logging, and health checks

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Message Queue**: RabbitMQ
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Validation**: Joi

## Architecture Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Strategy Pattern**: Retry mechanisms for queue processing
- **Response Wrapper**: Consistent API responses

## Quick Start

### Prerequisites

- Node.js >= 16
- Docker and Docker Compose
- MySQL 8.0
- RabbitMQ 3.x

### Installation

1. Clone the repository
```bash
git clone https://github.com/Aradhik11/Abdur-Rahmon-Dhikrullah.git
cd workforce-management
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start infrastructure services
```bash
docker-compose up -d
```

5. Run database migrations
```bash
npm run migrate
```

6. Start the application
```bash
npm run dev
```

## API Endpoints

### Departments
- `POST /api/departments` - Create a department
- `GET /api/departments/:id/employees?page=1&limit=10` - List department employees (paginated)

### Employees
- `POST /api/employees` - Create an employee
- `GET /api/employees/:id` - Get employee with leave history

### Leave Requests
- `POST /api/leave-requests` - Create a leave request (queued for processing)

### Health Check
- `GET /api/health` - Service health status

## Database Schema

### Departments
```sql
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);
```

### Employees
```sql
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  departmentId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  INDEX idx_department (departmentId),
  INDEX idx_email (email)
);
```

### Leave Requests
```sql
CREATE TABLE leave_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employeeId INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PENDING_APPROVAL') DEFAULT 'PENDING',
  processedAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id),
  INDEX idx_employee (employeeId),
  INDEX idx_status (status),
  INDEX idx_created (createdAt)
);
```

## Queue Processing

### Leave Request Processing
- Requests are published to `leave.requests` queue
- Auto-approval for leaves ≤ 2 days
- Longer leaves marked as `PENDING_APPROVAL`
- Dead letter queue for failed processing
- Exponential backoff retry strategy
- Idempotency to prevent duplicate processing

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Scalability Features

### Database Scaling
- Proper indexing on foreign keys and query columns
- Pagination for large datasets
- Connection pooling

### Queue Scaling
- Multiple consumers support
- Dead letter queues for failed messages
- Retry mechanisms with backoff strategies

### API Scaling
- Rate limiting (100 requests per 15 minutes)
- Request validation
- Error handling middleware
- Response caching headers

## Production Deployment

1. Set `NODE_ENV=production`
2. Use proper database migrations instead of sync
3. Configure external logging service
4. Set up monitoring and alerting
5. Use process manager (PM2)
6. Configure reverse proxy (Nginx)

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=workforce_management
DB_USER=root
DB_PASSWORD=password

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Error Handling

The system includes comprehensive error handling:
- Custom error classes
- Centralized error middleware
- Structured logging
- Graceful shutdown

