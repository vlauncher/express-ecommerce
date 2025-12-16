import { Sequelize } from 'sequelize';
import { dbConfig } from '../config/database';

let sequelize: Sequelize;

if (dbConfig.url) {
  // Production mode with connection URL
  sequelize = new Sequelize(dbConfig.url, {
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging,
  });
} else {
  // Development mode with individual parameters
  sequelize = new Sequelize({
    database: dbConfig.database,
    dialect: dbConfig.dialect,
    storage: dbConfig.storage,
    logging: dbConfig.logging,
  });
}

// Test the connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models - in production you might want to use migrations instead
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false }); // Use 'false' to avoid dropping existing tables
      console.log('Models synchronized.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize };