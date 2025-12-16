import request from 'supertest';
import app from '../../src/app';
import { User, Store, Otp } from '../../src/models';
import { sequelize } from '../../src/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Store and Tenant Resolution Integration', () => {
  let superAdminToken: string;
  let storeAdminToken: string;
  let customerToken: string;
  let store1: Store;
  let store2: Store;
  let superAdminUser: User;
  let storeAdminUser: User;
  let customerUser: User;

  beforeAll(async () => {
    // Create stores
    store1 = await Store.create({ name: 'Test Store 1', slug: 'test-store-1' });
    store2 = await Store.create({ name: 'Test Store 2', slug: 'test-store-2' });

    // Create users
    superAdminUser = await User.create({
      first_name: 'Super',
      last_name: 'Admin',
      email: 'superadmin@test.com',
      password: 'Password123!',
      is_verified: true,
      role: 'SUPER_ADMIN',
      storeId: null, // Super admin not tied to a specific store
    });

    storeAdminUser = await User.create({
      first_name: 'Store',
      last_name: 'Admin',
      email: 'storeadmin@test.com',
      password: 'Password123!',
      is_verified: true,
      role: 'STORE_ADMIN',
      storeId: store1.id,
    });

    customerUser = await User.create({
      first_name: 'Customer',
      last_name: 'User',
      email: 'customer@test.com',
      password: 'Password123!',
      is_verified: true,
      role: 'CUSTOMER',
      storeId: store1.id,
    });

    // Generate tokens
    superAdminToken = jwt.sign({ id: superAdminUser.id, email: superAdminUser.email }, JWT_SECRET, { expiresIn: '1h' });
    storeAdminToken = jwt.sign({ id: storeAdminUser.id, email: storeAdminUser.email }, JWT_SECRET, { expiresIn: '1h' });
    customerToken = jwt.sign({ id: customerUser.id, email: customerUser.email }, JWT_SECRET, { expiresIn: '1h' });
  });

  describe('Tenant Resolution Middleware', () => {
    it('should resolve tenant for valid x-tenant-id header', async () => {
      const res = await request(app)
        .get('/api/v1/health') // Using health endpoint as a generic public endpoint to test middleware
        .set('x-tenant-id', store1.id);

      expect(res.status).toBe(200);
      // In a real scenario, you'd check if `req.store` was correctly set in a route handler
      // For now, we just ensure it passes through and doesn't error.
    });

    it('should return 404 for invalid x-tenant-id header', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('x-tenant-id', 'invalid-store-id'); // Assuming UUID for store ID

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Store not found');
    });

    it('should proceed without store for missing x-tenant-id header', async () => {
      const res = await request(app)
        .get('/api/v1/health');

      expect(res.status).toBe(200);
    });
  });

  describe('Protected Auth Routes with Multi-tenancy', () => {
    it('should allow CUSTOMER to access /profile for their store', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('x-tenant-id', store1.id);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(customerUser.email);
      expect(res.body.store.id).toBe(store1.id);
    });

    it('should deny CUSTOMER access to /profile for a different store', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('x-tenant-id', store2.id); // Customer is associated with store1

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied: User not associated with this store');
    });

    it('should allow STORE_ADMIN to access /profile for their store', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${storeAdminToken}`)
        .set('x-tenant-id', store1.id);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(storeAdminUser.email);
      expect(res.body.store.id).toBe(store1.id);
    });

    it('should deny STORE_ADMIN access to /profile for a different store', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${storeAdminToken}`)
        .set('x-tenant-id', store2.id); // Store admin is associated with store1

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied: User not associated with this store');
    });

    it('should allow SUPER_ADMIN to access /profile for any store', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .set('x-tenant-id', store2.id); // Super admin can access store2

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(superAdminUser.email);
      expect(res.body.store.id).toBe(store2.id);
    });
  });

  describe('Protected Admin Health Route', () => {
    it('should deny CUSTOMER access to /admin-health', async () => {
      const res = await request(app)
        .get('/api/v1/health/admin-health')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('x-tenant-id', store1.id);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied: Insufficient permissions');
    });

    it('should deny STORE_ADMIN access to /admin-health', async () => {
      const res = await request(app)
        .get('/api/v1/health/admin-health')
        .set('Authorization', `Bearer ${storeAdminToken}`)
        .set('x-tenant-id', store1.id);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied: Insufficient permissions');
    });

    it('should allow SUPER_ADMIN access to /admin-health', async () => {
      const res = await request(app)
        .get('/api/v1/health/admin-health')
        .set('Authorization', `Bearer ${superAdminToken}`); // No tenant-id needed for super-admin specific routes if it's platform-wide

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Admin health check passed!');
      expect(res.body.user.email).toBe(superAdminUser.email);
    });

    it('should deny unauthenticated access to /admin-health', async () => {
        const res = await request(app)
          .get('/api/v1/health/admin-health');
  
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Authentication required');
    });
  });
});
