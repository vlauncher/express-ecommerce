import request from 'supertest';
import app from '../../src/app';
import { User, Store } from '../../src/models';
import { sequelize } from '../../src/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Health Check', () => {
  let superAdminToken: string;
  let superAdminUser: User;
  let testStore: Store;

  beforeAll(async () => {
    testStore = await Store.create({ name: 'Health Test Store', slug: 'health-test-store' });

    // Create a SUPER_ADMIN user
    superAdminUser = await User.create({
      first_name: 'Admin',
      last_name: 'Health',
      email: 'admin.health@test.com',
      password: 'Password123!',
      is_verified: true,
      role: 'SUPER_ADMIN',
      storeId: null,
    });

    // Generate token for SUPER_ADMIN
    superAdminToken = jwt.sign({ id: superAdminUser.id, email: superAdminUser.email }, JWT_SECRET, { expiresIn: '1h' });
  });

  it('should return 200 OK for public health endpoint', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'UP',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
    });
  });

  it('should allow SUPER_ADMIN access to /admin-health', async () => {
    const res = await request(app)
      .get('/api/v1/health/admin-health')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Admin health check passed!');
    expect(res.body.user.email).toBe(superAdminUser.email);
  });

  it('should deny unauthorized access to /admin-health', async () => {
    const res = await request(app)
      .get('/api/v1/health/admin-health');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authentication required');
  });

  it('should deny non-SUPER_ADMIN access to /admin-health', async () => {
    // Create a regular user
    const regularUser = await User.create({
      first_name: 'Regular',
      last_name: 'User',
      email: 'regular.user@test.com',
      password: 'Password123!',
      is_verified: true,
      role: 'CUSTOMER',
      storeId: testStore.id,
    });
    const regularUserToken = jwt.sign({ id: regularUser.id, email: regularUser.email }, JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/v1/health/admin-health')
      .set('Authorization', `Bearer ${regularUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Access denied: Insufficient permissions');
  });
});
