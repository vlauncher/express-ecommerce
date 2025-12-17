import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export const createProduct = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        
        const product = await ProductService.createProduct({ 
            ...req.body, 
            storeId: req.store.id,
            imageUrl 
        });
        res.status(201).json(product);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const products = await ProductService.getProducts(req.store.id, req.query);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const product = await ProductService.getProductById(req.params.id, req.store.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const product = await ProductService.updateProduct(req.params.id, req.store.id, req.body);
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        await ProductService.deleteProduct(req.params.id, req.store.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createVariant = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const variant = await ProductService.createVariant(req.params.id, req.store.id, req.body);
        res.status(201).json(variant);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
