import request from 'supertest';
import { getHealth } from '../../src/controllers/health.controller';

// Mock the controller
jest.mock('../../src/controllers/health.controller', () => ({
  getHealth: jest.fn(),
}));

// Import app AFTER mocking
import app from '../../src/app';

describe('Global Error Handler', () => {
  it('should handle internal server errors', async () => {
    // Make the controller throw an error
    (getHealth as jest.Mock).mockImplementation((req, res, next) => {
      next(new Error('Test Error'));
    });

    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: 'Internal Server Error',
      // error is undefined in test env
    });
  });
});
