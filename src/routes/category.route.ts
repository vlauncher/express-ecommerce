import express from 'express';
import * as CategoryController from '../controllers/category.controller';
import { authorize } from '../middlewares/authorize.middleware';
import { cacheResponse } from '../middlewares/cache.middleware';

const router = express.Router();

// Public
router.get('/', cacheResponse(3600), CategoryController.getCategories); // Cache categories for 1 hour
router.get('/:id', cacheResponse(3600), CategoryController.getCategoryById);

// Protected (Admin)
router.post('/', authorize(['STORE_ADMIN']), CategoryController.createCategory);
router.put('/:id', authorize(['STORE_ADMIN']), CategoryController.updateCategory);
router.delete('/:id', authorize(['STORE_ADMIN']), CategoryController.deleteCategory);

export default router;
