const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'departments',
  timestamps: false,
  indexes: [
    { fields: ['name'] }
  ]
});

module.exports = Department;