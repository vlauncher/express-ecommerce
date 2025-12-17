import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const cacheResponse = (duration: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Key should include store context if tenant specific!
        // req.store is resolved before this middleware if placed correctly.
        // If not, we risk sharing cache between stores.
        // We should append storeId to the key.
        const storeId = req.store?.id || 'global';
        const key = `cache:${storeId}:${req.originalUrl || req.url}`;

        try {
            const cachedBody = await redisClient.get(key);
            if (cachedBody) {
                res.setHeader('X-Cache', 'HIT');
                return res.json(JSON.parse(cachedBody));
            } else {
                // Intercept res.json to cache the response
                const originalJson = res.json;
                res.json = (body) => {
                    res.setHeader('X-Cache', 'MISS');
                    redisClient.setEx(key, duration, JSON.stringify(body))
                        .catch(err => console.error('Redis cache error:', err));
                    return originalJson.call(res, body);
                };
                next();
            }
        } catch (error) {
            console.error('Redis error:', error);
            next();
        }
    };
};
