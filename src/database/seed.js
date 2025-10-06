const { Department, Employee, LeaveRequest } = require('../models');
const logger = require('../utils/logger');

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Create departments
    const engineering = await Department.create({ name: 'Engineering' });
    const hr = await Department.create({ name: 'Human Resources' });
    const marketing = await Department.create({ name: 'Marketing' });

    // Create employees
    const employees = await Employee.bulkCreate([
      {
        name: 'Aradhik Camboy',
        email: 'aradhik.camboy@company.com',
        departmentId: engineering.id
      },
      {
        name: 'Owolabi Ajibola',
        email: 'owolabi.ajibola@company.com',
        departmentId: hr.id
      },
      {
        name: 'Onisabi Abdullah',
        email: 'onisabi.abdullah@company.com',
        departmentId: engineering.id
      },
      {
        name: 'Khalid Lawwal',
        email: 'khalid.lawal@company.com',
        departmentId: marketing.id
      }
    ]);

    // Create some sample leave requests
    await LeaveRequest.bulkCreate([
      {
        employeeId: employees[0].id,
        startDate: '2024-02-15',
        endDate: '2024-02-16',
        status: 'APPROVED'
      },
      {
        employeeId: employees[1].id,
        startDate: '2024-03-01',
        endDate: '2024-03-05',
        status: 'PENDING_APPROVAL'
      }
    ]);

    logger.info('Database seeding completed successfully');
    logger.info(`Created ${await Department.count()} departments`);
    logger.info(`Created ${await Employee.count()} employees`);
    logger.info(`Created ${await LeaveRequest.count()} leave requests`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;