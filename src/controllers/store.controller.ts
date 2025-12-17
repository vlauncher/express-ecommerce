import { Request, Response } from 'express';
import { Store } from '../models';

export const createStore = async (req: Request, res: Response) => {
    try {
        const { name, slug, domain } = req.body;
        
        if (!name || !slug) {
             return res.status(400).json({ message: 'Name and slug are required' });
        }

        const existing = await Store.findOne({ where: { slug } });
        if (existing) return res.status(400).json({ message: 'Store slug already exists' });

        const store = await Store.create({ name, slug, domain });
        res.status(201).json(store);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStores = async (req: Request, res: Response) => {
    try {
        const stores = await Store.findAll();
        res.json(stores);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
