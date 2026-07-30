import request from 'supertest';
import app from './index';

describe('Store Ratings Platform Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 OK and health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /api/auth/register validations', () => {
    it('should fail registration if name is shorter than 20 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Name', // less than 20 characters
          email: 'test@example.com',
          password: 'Password123!',
          address: '123 Main Street, Townsville',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('name');
      expect(response.body.errors.name).toContain('between 20 and 60 characters');
    });

    it('should fail registration if password lacks special character or uppercase', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Valid Name Between 20 and 60 Chars', // 34 chars
          email: 'test@example.com',
          password: 'password123', // no uppercase, no special char
          address: '123 Main Street, Townsville',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('password');
    });

    it('should fail registration if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Valid Name Between 20 and 60 Chars',
          email: 'not-an-email',
          password: 'Password123!',
          address: '123 Main Street, Townsville',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('email');
    });
  });

  describe('POST /api/auth/login validation', () => {
    it('should return 401 for incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@user.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid');
    });
  });
});
