import { Queue, Worker } from 'bullmq';
import { emailService } from '../services/email.service';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const emailQueue = new Queue('email-queue', { connection });

export const emailWorker = new Worker('email-queue', async (job) => {
  const { type, data } = job.data;
  
  console.log(`Processing email job: ${type} for ${data.to}`);

  try {
    if (type === 'otp') {
      await emailService.sendOtp(data.to, data.otp);
    } else if (type === 'generic') {
      await emailService.sendEmail(data);
    }
  } catch (error) {
    console.error(`Failed to send email for job ${job.id}:`, error);
    throw error;
  }
}, { connection });

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.log(`Email job ${job.id} failed with ${err.message}`);
});
