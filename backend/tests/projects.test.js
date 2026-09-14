const request = require('supertest');
const app = require('../app');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

describe('Project Management Tests', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Project Owner',
        email: 'owner@example.com',
        password: 'password123'
      });

    token = regRes.body.data.token;
    userId = regRes.body.data.user._id;
  });

  describe('POST /api/projects', () => {
    it('should create a project for authenticated user', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Mobile App Redesign',
          description: 'Overhaul the mobile app interface',
          status: 'In Progress'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe('Mobile App Redesign');
      expect(res.body.data.userId).toBe(userId);
    });

    it('should reject project creation without a name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Missing name'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Alpha Website', status: 'In Progress' });

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Beta Backend', status: 'Completed' });

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Gamma Design', status: 'Not Started' });
    });

    it('should retrieve all projects belonging to user', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it('should filter projects by status', async () => {
      const res = await request(app)
        .get('/api/projects?status=Completed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Beta Backend');
    });

    it('should search projects by name', async () => {
      const res = await request(app)
        .get('/api/projects?search=gamma')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Gamma Design');
    });
  });

  describe('PUT /api/projects/:id and DELETE /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original Project', status: 'Not Started' });
      projectId = res.body.data._id;
    });

    it('should update project details', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Project Name',
          status: 'In Progress'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Project Name');
      expect(res.body.data.status).toBe('In Progress');
    });

    it('should delete project and cascade delete associated tasks', async () => {
      // Create a task inside this project
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'Project Task 1',
          priority: 'High'
        });

      const taskCountBefore = await Task.countDocuments({ projectId });
      expect(taskCountBefore).toBe(1);

      // Delete the project
      const delRes = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(delRes.statusCode).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Verify project is deleted
      const foundProject = await Project.findById(projectId);
      expect(foundProject).toBeNull();

      // Verify associated tasks were cascade-deleted!
      const taskCountAfter = await Task.countDocuments({ projectId });
      expect(taskCountAfter).toBe(0);
    });
  });
});
