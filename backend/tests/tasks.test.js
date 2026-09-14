const request = require('supertest');
const app = require('../app');
const Task = require('../src/models/Task');

describe('Task Management Tests', () => {
  let token;
  let projectId;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Task Master',
        email: 'tasks@example.com',
        password: 'password123'
      });

    token = regRes.body.data.token;

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Task Parent Project' });

    projectId = projRes.body.data._id;
  });

  describe('POST /api/tasks', () => {
    it('should create a task under the owned project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'Implement OAuth Flow',
          description: 'Add Google and GitHub SSO',
          priority: 'High',
          status: 'In Progress'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Implement OAuth Flow');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data.status).toBe('In Progress');
      expect(res.body.data.projectId._id || res.body.data.projectId).toBe(projectId);
    });

    it('should reject task creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId
          // name missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks and filtering', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId, name: 'Setup database', priority: 'High', status: 'Completed' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId, name: 'Setup router', priority: 'Low', status: 'Pending' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId, name: 'Write docs', priority: 'Medium', status: 'In Progress' });
    });

    it('should list all tasks for user projects', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=Pending')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Setup router');
    });

    it('should filter tasks by priority', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=High')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Setup database');
    });

    it('should search tasks by name', async () => {
      const res = await request(app)
        .get('/api/tasks?search=docs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Write docs');
    });
  });

  describe('PUT /api/tasks/:id & DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId, name: 'Initial Task', status: 'Pending' });
      taskId = res.body.data._id;
    });

    it('should update task and mark as completed', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'Completed'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Completed');
    });

    it('should delete task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const found = await Task.findById(taskId);
      expect(found).toBeNull();
    });
  });
});
