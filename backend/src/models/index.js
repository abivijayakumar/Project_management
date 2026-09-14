const { getSequelize } = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');

const sequelize = getSequelize();

// Define Relationships
User.hasMany(Project, {
  foreignKey: 'userId',
  as: 'projects',
  onDelete: 'CASCADE'
});

Project.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks',
  onDelete: 'CASCADE'
});

Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

module.exports = {
  sequelize,
  User,
  Project,
  Task
};
