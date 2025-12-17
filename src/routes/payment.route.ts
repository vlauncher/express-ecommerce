import express from 'express';
import * as PaymentController from '../controllers/payment.controller';

const router = express.Router();

// Paystack Webhook
router.post('/webhook', PaymentController.handlePaystackWebhook);

export default router;
