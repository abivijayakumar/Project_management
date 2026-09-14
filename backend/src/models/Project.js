const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const sequelize = getSequelize();

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Project name is required' },
      len: { args: [1, 150], msg: 'Project name cannot exceed 150 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed'),
    defaultValue: 'Not Started',
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      const id = this.getDataValue('id');
      return id != null ? id.toString() : null;
    }
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'status'] },
    { fields: ['userId', 'createdAt'] },
    { fields: ['userId', 'name'] }
  ]
});

Project.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id != null ? values.id.toString() : null;
  return values;
};

module.exports = Project;
