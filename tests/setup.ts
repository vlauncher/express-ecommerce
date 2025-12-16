// Global test setup
import { sequelize } from '../src/database';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables (if any, for example for JWT_SECRET in tests)
// This will load .env and then .env.test if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

beforeAll(async () => {
    // Ensure we are using the test environment configuration from config.json
    process.env.NODE_ENV = 'test';
    
    // Sync database
    // For SQLite :memory: the tables need to be created anew for each test run if needed
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});
