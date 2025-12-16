import { Request, Response, NextFunction } from 'express';
import { User } from '../models'; // Assuming User model is available
import { Store } from '../models';

// Define possible user roles
export type UserRole = 'SUPER_ADMIN' | 'STORE_ADMIN' | 'CUSTOMER';

// Extend Request to include authenticated user and store
declare global {
  namespace Express {
    interface Request {
      user?: User; // Assuming auth middleware would set this
      store?: Store; // Assuming resolveTenant middleware sets this
    }
  }
}

/**
 * Middleware to check if the authenticated user has any of the required roles.
 * @param requiredRoles - An array of roles that are allowed to access the route.
 */
export const authorize = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Assuming authentication middleware has already populated req.user
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // SUPER_ADMIN can bypass store checks and access anything
    if (req.user.role === 'SUPER_ADMIN') {
        return next();
    }

    // For STORE_ADMIN and CUSTOMER, we need to ensure they are associated with the current store (if any)
    if (req.store && req.user.storeId && req.user.storeId !== req.store.id) {
        return res.status(403).json({ message: 'Access denied: User not associated with this store' });
    }

    // Check if the user's role is included in the requiredRoles
    if (requiredRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
  };
};