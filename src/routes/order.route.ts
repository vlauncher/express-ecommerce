import express from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize as authorizeRole } from '../middlewares/authorize.middleware';

const router = express.Router();

// Protected Routes (User needs to be logged in to see history, but maybe guest can create order?)
// createOrder handles both guest (session) and user.
// But current implementation relies on `req.user` or session. 
// Let's allow public access for creation, but check auth inside if needed.
// Actually, `createOrder` checks session.

router.post('/', OrderController.createOrder); // Public/Guest Checkout possible

router.get('/', authenticate, OrderController.getOrders);
router.get('/:id', authenticate, OrderController.getOrderById);

// Admin
router.patch('/:id/status', authenticate, authorizeRole(['STORE_ADMIN']), OrderController.updateOrderStatus);

export default router;
