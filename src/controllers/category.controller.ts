import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export const createCategory = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const category = await CategoryService.createCategory({ ...req.body, storeId: req.store.id });
        res.status(201).json(category);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const categories = await CategoryService.getCategories(req.store.id);
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const category = await CategoryService.getCategoryById(req.params.id, req.store.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const category = await CategoryService.updateCategory(req.params.id, req.store.id, req.body);
        res.json(category);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        await CategoryService.deleteCategory(req.params.id, req.store.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
