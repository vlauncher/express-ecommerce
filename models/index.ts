import { sequelize } from '../database';

// Export the centralized sequelize instance
export default sequelize;

// Export an empty object that can be extended later with actual models
const models = {};

export { models };