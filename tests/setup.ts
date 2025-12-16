// Global test setup
import { sequelize } from '../src/database';

beforeAll(async () => {
    // Ensure we are using sqlite for tests
    process.env.NODE_ENV = 'test';
    
    // Sync database
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});
