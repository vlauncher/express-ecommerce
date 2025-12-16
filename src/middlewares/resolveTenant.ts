import { Request, Response, NextFunction } from 'express';
import { Store } from '../models';

export const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    // If no tenant header, we proceed. 
    // Some routes might be global (like login, or creating a store).
    return next();
  }

  try {
    const store = await Store.findByPk(tenantId);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    req.store = store;
    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    return res.status(500).json({ message: 'Internal Server Error during tenant resolution' });
  }
};
