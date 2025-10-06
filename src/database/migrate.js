const sequelize = require('./config');
const { Department, Employee, LeaveRequest } = require('../models');
const logger = require('../utils/logger');

async function migrate() {
  try {
    logger.info('Starting database migration...');
    
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Create tables with proper foreign key constraints
    await sequelize.sync({ force: false, alter: true });
    
    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;