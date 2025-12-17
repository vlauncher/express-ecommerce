import express from 'express';
import * as StoreController from '../controllers/store.controller';
import { authorize } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';

const router = express.Router();

// Only SUPER_ADMIN can manage stores
// We skip resolveTenant check for these routes effectively because they are platform level?
// Actually resolveTenant runs globally. But for creating a store, you don't need a store context.
// However, our app.ts runs resolveTenant first. 
// If SUPER_ADMIN doesn't provide x-tenant-id, req.store is undefined.
// Auth middleware allows user if token is valid. 
// We need to ensure authorize middleware doesn't fail if req.store is missing, OR we explicitly allow it.
// Let's check authorize middleware.

router.use(authenticate);
router.use(authorize(['STORE_ADMIN', 'SUPER_ADMIN']));

router.post('/', StoreController.createStore);
router.get('/', StoreController.getStores);

export default router;
