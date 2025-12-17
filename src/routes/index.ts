import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from './auth.route';
import categoryRouter from './category.route';
import productRouter from './product.route';
import cartRouter from './cart.route';
import orderRouter from './order.route';
import paymentRouter from './payment.route';
import analyticsRouter from './analytics.route';
import storeRouter from './store.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/stores', storeRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/payments', paymentRouter);
router.use('/analytics', analyticsRouter);

export default router;
