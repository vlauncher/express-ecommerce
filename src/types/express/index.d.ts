import { Store, User } from '../../models';

declare global {
  namespace Express {
    interface Request {
      store?: Store;
      user?: User;
    }
  }
}
