import express from 'express';
import * as AnalyticsController from '../controllers/analytics.controller';
import { authorize } from '../middlewares/authorize.middleware';

const router = express.Router();

router.get('/sales', authorize(['STORE_ADMIN']), AnalyticsController.getSalesStats);
router.get('/top-products', authorize(['STORE_ADMIN']), AnalyticsController.getTopProducts);

export default router;
