const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');

describe('Authentication Tests', () => {
  const validUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a token and user info', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', validUser.email);
      expect(res.body.data.user).toHaveProperty('fullName', validUser.fullName);
      expect(res.body.data.user).not.toHaveProperty('password');

      // Verify user is actually saved in MongoDB with hashed password
      const savedUser = await User.findOne({ email: validUser.email }).select('+password');
      expect(savedUser).not.toBeNull();
      expect(savedUser.password).not.toBe(validUser.password); // Must be hashed!
    });

    it('should reject registration when email already exists', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'not-an-email',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'valid@example.com',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should log in with valid credentials and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me & Protected Routes', () => {
    it('should return 401 when accessing protected route without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when accessing protected route with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user profile when valid token provided', async () => {
      const regRes = await request(app).post('/api/auth/register').send(validUser);
      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data).not.toHaveProperty('password');
    });
  });
});
