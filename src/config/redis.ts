import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

(async () => {
    try {
        await redisClient.connect();
    } catch (e) {
        console.error("Failed to connect to Redis:", e);
    }
})();

export default redisClient;
