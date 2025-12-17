import express from 'express';
import * as ProductController from '../controllers/product.controller';
import { authorize } from '../middlewares/authorize.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = express.Router();

// Public
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Protected (Admin)
router.post('/', authorize(['STORE_ADMIN']), upload.single('image'), ProductController.createProduct);
router.put('/:id', authorize(['STORE_ADMIN']), ProductController.updateProduct);
router.delete('/:id', authorize(['STORE_ADMIN']), ProductController.deleteProduct);

// Variants
router.post('/:id/variants', authorize(['STORE_ADMIN']), ProductController.createVariant);

export default router;
