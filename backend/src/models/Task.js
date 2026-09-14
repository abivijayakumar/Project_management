const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const sequelize = getSequelize();

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task name is required' },
      len: { args: [1, 150], msg: 'Task name cannot exceed 150 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
    defaultValue: 'Pending',
    allowNull: false
  },
  dueDate: {
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
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['projectId', 'status'] },
    { fields: ['projectId', 'priority'] },
    { fields: ['projectId', 'dueDate'] }
  ]
});

Task.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id != null ? values.id.toString() : null;
  if (this.project) {
    const projectJson = typeof this.project.toJSON === 'function' ? this.project.toJSON() : this.project;
    values.projectId = projectJson;
    values.project = projectJson;
  }
  return values;
};

module.exports = Task;
