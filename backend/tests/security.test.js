const request = require('supertest');
const app = require('../app');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

describe('Security & Multi-Tenant Ownership Isolation Tests', () => {
  let userAToken;
  let userBToken;
  let userAProjectId;
  let userATaskId;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alice Anderson',
        email: 'alice@example.com',
        password: 'password123'
      });
    userAToken = resA.body.data.token;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Bob Brown',
        email: 'bob@example.com',
        password: 'password123'
      });
    userBToken = resB.body.data.token;

    // User A creates a project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Alice Secret Project',
        description: 'Classified project for Alice only'
      });
    userAProjectId = projRes.body.data._id;

    // User A creates a task inside Project A
    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        projectId: userAProjectId,
        name: 'Alice Confidential Task',
        priority: 'High'
      });
    userATaskId = taskRes.body.data._id;
  });

  describe('Project Access Isolation', () => {
    it('User B cannot view User A\'s project by ID', async () => {
      const res = await request(app)
        .get(`/api/projects/${userAProjectId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect([403, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });

    it('User B does not see User A\'s projects in project list', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0); // Bob has 0 projects
    });

    it('User B cannot modify User A\'s project', async () => {
      const res = await request(app)
        .put(`/api/projects/${userAProjectId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          name: 'Hacked by Bob'
        });

      expect([403, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);

      // Verify project name was NOT changed
      const original = await Project.findById(userAProjectId);
      expect(original.name).toBe('Alice Secret Project');
    });

    it('User B cannot delete User A\'s project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${userAProjectId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect([403, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);

      // Verify project still exists in DB
      const original = await Project.findById(userAProjectId);
      expect(original).not.toBeNull();
    });
  });

  describe('Task Access Isolation', () => {
    it('User B cannot create a task inside User A\'s project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          projectId: userAProjectId,
          name: 'Bob Rogue Task'
        });

      expect([403, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);

      // Verify task was not created
      const rogueTask = await Task.findOne({ name: 'Bob Rogue Task' });
      expect(rogueTask).toBeNull();
    });

    it('User B cannot view User A\'s task by ID', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect([403, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });

    it('User B does not see User A\'s tasks in task list', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('User B cannot modify User A\'s task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          name: 'Tampered by Bob'
        });

      expect([403, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);

      const task = await Task.findById(userATaskId);
      expect(task.name).toBe('Alice Confidential Task');
    });

    it('User B cannot delete User A\'s task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect([403, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);

      const task = await Task.findById(userATaskId);
      expect(task).not.toBeNull();
    });
  });

  describe('Dashboard Isolation', () => {
    it('User B dashboard does not aggregate or leak User A\'s metrics', async () => {
      const resB = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resB.statusCode).toBe(200);
      expect(resB.body.success).toBe(true);
      expect(resB.body.data.totalProjects).toBe(0);
      expect(resB.body.data.totalTasks).toBe(0);

      // Verify User A dashboard correctly reflects their own counts
      const resA = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(resA.statusCode).toBe(200);
      expect(resA.body.data.totalProjects).toBe(1);
      expect(resA.body.data.totalTasks).toBe(1);
    });
  });
});
