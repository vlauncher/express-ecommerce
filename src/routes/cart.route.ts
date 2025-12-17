import express from 'express';
import * as CartController from '../controllers/cart.controller';
// Cart is public but session based, or authenticated. 
// We handle both in controller (check user or header).

const router = express.Router();

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.patch('/item', CartController.updateCartItem);
router.delete('/item', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

export default router;
