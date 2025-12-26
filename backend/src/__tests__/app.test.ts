import request from 'supertest';
import app from '../app';

describe('App Basic Tests', () => {
  it('health check works', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
  });
});
