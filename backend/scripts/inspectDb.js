const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { initDatabase } = require('../src/config/database');

async function inspect() {
  const DB_NAME = process.env.DB_NAME || 'project_management';
  const DB_HOST = process.env.DB_HOST || '127.0.0.1';
  const DB_PORT = process.env.DB_PORT || 3306;

  console.log('====================================================');
  console.log('🔍 Pulse Database Inspector (Relational / SQL)');
  console.log(`📡 Connecting to: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);
  console.log('====================================================\n');

  const sequelize = await initDatabase();
  const { User, Project, Task } = require('../src/models');
  await sequelize.sync();

  // 1. Users
  const users = await User.findAll({ order: [['id', 'ASC']] });
  console.log(`👤 USERS (${users.length} total):`);
  if (users.length === 0) {
    console.log('   (No users found in database)');
  } else {
    console.table(users.map(u => ({
      ID: u.id,
      Name: u.fullName,
      Email: u.email,
      'Created At': new Date(u.createdAt).toLocaleString()
    })));
  }
  console.log('\n');

  // 2. Projects
  const projects = await Project.findAll({
    include: [{ model: User, as: 'user', attributes: ['email', 'fullName'] }],
    order: [['id', 'ASC']]
  });
  console.log(`📁 PROJECTS (${projects.length} total):`);
  if (projects.length === 0) {
    console.log('   (No projects found in database)');
  } else {
    console.table(projects.map(p => ({
      ID: p.id,
      Name: p.name,
      Status: p.status,
      Owner: p.user ? p.user.email : `User #${p.userId}`,
      'Start Date': p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A',
      'End Date': p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'
    })));
  }
  console.log('\n');

  // 3. Tasks
  const tasks = await Task.findAll({
    include: [{ model: Project, as: 'project', attributes: ['name'] }],
    order: [['id', 'ASC']]
  });
  console.log(`📋 TASKS (${tasks.length} total):`);
  if (tasks.length === 0) {
    console.log('   (No tasks found in database)');
  } else {
    console.table(tasks.map(t => ({
      ID: t.id,
      Name: t.name,
      Project: t.project ? t.project.name : `Project #${t.projectId}`,
      Status: t.status,
      Priority: t.priority,
      'Due Date': t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
    })));
  }
  console.log('====================================================');

  await sequelize.close();
}

inspect().catch(err => {
  console.error('\n❌ Could not connect to database:', err.message);
  process.exit(1);
});
