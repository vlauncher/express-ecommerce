import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  NODE_ENV = 'development',
  DATABASE_URL = 'sqlite://./dev.sqlite',
} = process.env;

interface DbConfig {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  dialect: Dialect;
  storage?: string;
  dialectOptions?: any;
  url?: string;
  logging?: boolean | ((sql: string) => void);
}

let dbConfig: DbConfig;

if (NODE_ENV === 'production') {
  // For production, use PostgreSQL via DATABASE_URL
  dbConfig = {
    url: DATABASE_URL,
    dialect: 'postgres' as Dialect,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };
} else {
  // For development, use SQLite
  dbConfig = {
    database: './dev.sqlite',
    dialect: 'sqlite' as Dialect,
    storage: './dev.sqlite',
  };
}

// Add logging only in development
if (NODE_ENV !== 'production') {
  dbConfig.logging = console.log;
}

export { dbConfig, NODE_ENV };