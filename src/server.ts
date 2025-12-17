import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './database';
import './jobs/email.queue'; // Initialize background workers

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    
    // Temporary debug logs for email credentials
    console.log('DEBUG: EMAIL_HOST_USER:', process.env.EMAIL_HOST_USER ? 'Loaded' : 'NOT LOADED');
    console.log('DEBUG: EMAIL_HOST_PASSWORD:', process.env.EMAIL_HOST_PASSWORD ? 'Loaded' : 'NOT LOADED');
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful Shutdown
    const gracefulShutdown = () => {
      console.log('Received kill signal, shutting down gracefully');
      server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
