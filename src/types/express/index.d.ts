import { Store } from '../../models';

declare global {
  namespace Express {
    interface Request {
      store?: Store;
    }
  }
}
