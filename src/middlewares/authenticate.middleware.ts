import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Allow unauthenticated access for some routes, handle 401 in authorize if needed
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(); // Same as above
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    // console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed: Invalid or expired token' });
  }
};
