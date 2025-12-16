import request from 'supertest';
import app from '../../src/app';

describe('Error Handling Integration', () => {
    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/v1/unknown-route');
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Not Found' });
    });

    it('should return 200 for Redoc JSON spec', async () => {
        const res = await request(app).get('/doc-json');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('openapi');
    });

    // To test 500 error, we need to mock a route or force an error.
    // We can define a test-only route in the app if NODE_ENV is test, or mock something that throws.
    // However, app is already imported.
    // A trick is to mock a controller method that is hit by a route.
    // But this is integration test with real app.
    // I will mock `src/controllers/health.controller.ts` for a specific test case?
    // No, I can't easily modify the app instance already imported.
    
    // I will use a separate test file for 500 where I mock the controller BEFORE importing app.
});
