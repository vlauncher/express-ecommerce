import express from 'express';
import * as CategoryController from '../controllers/category.controller';
import { authorize } from '../middlewares/authorize.middleware';

const router = express.Router();

// Public
router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);

// Protected (Admin)
router.post('/', authorize(['STORE_ADMIN']), CategoryController.createCategory);
router.put('/:id', authorize(['STORE_ADMIN']), CategoryController.updateCategory);
router.delete('/:id', authorize(['STORE_ADMIN']), CategoryController.deleteCategory);

export default router;
