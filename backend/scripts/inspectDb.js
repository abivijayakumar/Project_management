const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

async function inspect() {
  let uri = process.env.MONGODB_URI;

  // Check if active dynamic URI exists
  const activeUriPath = path.join(__dirname, '../.active-db-uri');
  if (fs.existsSync(activeUriPath)) {
    const savedUri = fs.readFileSync(activeUriPath, 'utf8').trim();
    if (savedUri) uri = savedUri;
  }

  if (!uri) {
    uri = 'mongodb://127.0.0.1:27017/project_management';
  }

  console.log('====================================================');
  console.log('🔍 Pulse Database Inspector');
  console.log(`📡 Connecting to: ${uri}`);
  console.log('====================================================\n');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // 1. Users
  const users = await User.find({}).lean();
  console.log(`👤 USERS (${users.length} total):`);
  if (users.length === 0) {
    console.log('   (No users found in database)');
  } else {
    console.table(users.map(u => ({
      ID: u._id.toString(),
      Name: u.fullName,
      Email: u.email,
      'Created At': new Date(u.createdAt).toLocaleString()
    })));
  }
  console.log('\n');

  // 2. Projects
  const projects = await Project.find({}).populate('userId', 'email fullName').lean();
  console.log(`📁 PROJECTS (${projects.length} total):`);
  if (projects.length === 0) {
    console.log('   (No projects found in database)');
  } else {
    console.table(projects.map(p => ({
      ID: p._id.toString(),
      Name: p.name,
      Status: p.status,
      Owner: p.userId?.email || p.userId?.toString() || 'Unknown',
      'Start Date': p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A',
      'End Date': p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'
    })));
  }
  console.log('\n');

  // 3. Tasks
  const tasks = await Task.find({}).populate('projectId', 'name').lean();
  console.log(`📋 TASKS (${tasks.length} total):`);
  if (tasks.length === 0) {
    console.log('   (No tasks found in database)');
  } else {
    console.table(tasks.map(t => ({
      ID: t._id.toString(),
      Name: t.name,
      Project: t.projectId?.name || t.projectId?.toString() || 'Unknown',
      Status: t.status,
      Priority: t.priority,
      'Due Date': t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
    })));
  }
  console.log('====================================================');

  await mongoose.connection.close();
}

inspect().catch(err => {
  console.error('\n❌ Could not connect to database:', err.message);
  console.log('Make sure the backend server is running or MongoDB is active.');
  process.exit(1);
});
