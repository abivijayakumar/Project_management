const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seedData = async () => {
  console.log('[Seed] Seeding sample data into database...');

  // Clean existing demo data if any
  const existingUsers = await User.find({
    email: { $in: ['alex@pulse.dev', 'sarah@pulse.dev'] }
  });

  for (const u of existingUsers) {
    const userProjects = await Project.find({ userId: u._id });
    const projectIds = userProjects.map(p => p._id);
    await Task.deleteMany({ projectId: { $in: projectIds } });
    await Project.deleteMany({ userId: u._id });
    await User.deleteOne({ _id: u._id });
  }

  // 1. Create Primary Demo User
  const alex = await User.create({
    fullName: 'Alex Mercer',
    email: 'alex@pulse.dev',
    password: 'Password123!' // will be hashed by pre-save hook
  });

  // 2. Create Secondary Demo User (for multi-tenant isolation testing)
  const sarah = await User.create({
    fullName: 'Sarah Chen',
    email: 'sarah@pulse.dev',
    password: 'Password123!'
  });

  // Projects for Alex
  const project1 = await Project.create({
    userId: alex._id,
    name: 'Mobile App Redesign (iOS & Android)',
    description: 'Complete overhaul of mobile user experience featuring modern dark mode, biometric login, and offline synchronization.',
    status: 'In Progress',
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-10-31')
  });

  const project2 = await Project.create({
    userId: alex._id,
    name: 'Cloud Infrastructure & Microservices Migration',
    description: 'Migrating monolithic architecture into resilient Kubernetes microservices with automated CI/CD and telemetry.',
    status: 'Completed',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-09-01')
  });

  const project3 = await Project.create({
    userId: alex._id,
    name: 'AI-Powered Semantic Search Engine',
    description: 'Implement vector database integration (Pinecone/Milvus) with semantic embeddings for ultra-fast contextual search.',
    status: 'Not Started',
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-12-31')
  });

  // Tasks for Project 1 (Mobile App)
  await Task.create([
    {
      projectId: project1._id,
      name: 'Design high-fidelity Figma components & dark mode tokens',
      description: 'Create standardized design system for iOS & Android with dynamic contrast ratios.',
      priority: 'High',
      status: 'Completed',
      dueDate: new Date('2026-08-20')
    },
    {
      projectId: project1._id,
      name: 'Integrate Biometric FaceID & Fingerprint Authentication',
      description: 'Leverage device native secure enclaves for instant passwordless sign-in.',
      priority: 'High',
      status: 'Completed',
      dueDate: new Date('2026-09-01')
    },
    {
      projectId: project1._id,
      name: 'Implement offline sync queue with IndexedDB & service workers',
      description: 'Buffer network mutations while disconnected and automatically flush when back online.',
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date('2026-09-28')
    },
    {
      projectId: project1._id,
      name: 'Setup Apple APNS and Firebase FCM push notifications',
      description: 'Trigger actionable background push alerts for task assignments and status updates.',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date('2026-10-15')
    },
    {
      projectId: project1._id,
      name: 'Apple App Store & Google Play submission audit',
      description: 'Ensure strict compliance with privacy policies, data safety declarations, and SDK versions.',
      priority: 'Low',
      status: 'Pending',
      dueDate: new Date('2026-10-25')
    }
  ]);

  // Tasks for Project 2 (Cloud Infrastructure)
  await Task.create([
    {
      projectId: project2._id,
      name: 'Upgrade EKS Kubernetes clusters to v1.30',
      description: 'Apply rolling upgrades across all production node groups without downtime.',
      priority: 'High',
      status: 'Completed',
      dueDate: new Date('2026-07-15')
    },
    {
      projectId: project2._id,
      name: 'Deploy Prometheus & Grafana distributed telemetry dashboards',
      description: 'Instrument API latency, p99 metrics, and container memory thresholds with PagerDuty alerts.',
      priority: 'Medium',
      status: 'Completed',
      dueDate: new Date('2026-08-01')
    },
    {
      projectId: project2._id,
      name: 'Automate immutable S3 daily database backup snapshots',
      description: 'Configure daily cron snapshots with cross-region replication and 30-day retention policies.',
      priority: 'High',
      status: 'Completed',
      dueDate: new Date('2026-08-25')
    }
  ]);

  // Tasks for Project 3 (AI Search Engine)
  await Task.create([
    {
      projectId: project3._id,
      name: 'Benchmark Vector Embeddings Models (Voyage vs OpenAI text-3-large)',
      description: 'Compare latency, token costs, and MTEB retrieval scores across sample project documents.',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date('2026-10-10')
    },
    {
      projectId: project3._id,
      name: 'Implement hybrid keyword + dense vector search pipeline',
      description: 'Combine BM25 lexical ranking with reciprocal rank fusion (RRF) for maximum precision.',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date('2026-10-25')
    }
  ]);

  // Project and Task for Sarah (Multi-tenant isolation demonstration)
  const sarahProject = await Project.create({
    userId: sarah._id,
    name: 'Q4 Product Marketing & Press Campaign',
    description: 'Global outreach campaign for the upcoming enterprise release.',
    status: 'In Progress',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-11-30')
  });

  await Task.create({
    projectId: sarahProject._id,
    name: 'Draft press release and coordinate TechCrunch exclusivity',
    description: 'Coordinate embargo timings and media kit distributions.',
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date('2026-09-30')
  });

  console.log('[Seed] Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('User 1 (Primary):   alex@pulse.dev  / Password123!');
  console.log('User 2 (Isolation): sarah@pulse.dev / Password123!');
  console.log('----------------------------------------------------');
};

// Standalone execution support
if (require.main === module) {
  require('dotenv').config();
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_management';
  mongoose.connect(uri)
    .then(async () => {
      await seedData();
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err.message);
      process.exit(1);
    });
}

module.exports = { seedData };
