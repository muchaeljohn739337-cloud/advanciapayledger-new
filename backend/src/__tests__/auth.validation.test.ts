import request from 'supertest';
import app from '../app';

describe('Authentication API Tests (No DB)', () => {
  describe('POST /api/auth/register', () => {
    it('validates email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Validation');
    });

    it('enforces password length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Validation');
    });

    it('enforces username length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'ab',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Validation');
    });
  });

  describe('POST /api/auth/login', () => {
    it('validates email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Validation');
    });

    it('requires password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Validation');
    });
  });
});
