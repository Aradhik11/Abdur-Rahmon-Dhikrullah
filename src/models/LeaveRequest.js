const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'PENDING_APPROVAL'),
    defaultValue: 'PENDING'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'leave_requests',
  timestamps: false,
  indexes: [
    { fields: ['employeeId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = LeaveRequest;