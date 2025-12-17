import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

const getSessionId = (req: Request) => {
    if (req.user) return req.user.id.toString();
    const sessionId = req.headers['x-session-id'] as string;
    return sessionId;
};

export const addToCart = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const sessionId = getSessionId(req);
        if (!sessionId) return res.status(400).json({ message: 'Missing user context or x-session-id' });

        const cart = await CartService.addToCart(req.store.id, sessionId, req.body);
        res.json(cart);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCart = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const sessionId = getSessionId(req);
        if (!sessionId) return res.status(400).json({ message: 'Missing user context or x-session-id' });

        const cart = await CartService.getCart(req.store.id, sessionId);
        res.json(cart);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const sessionId = getSessionId(req);
        if (!sessionId) return res.status(400).json({ message: 'Missing user context or x-session-id' });

        const { itemKey, quantity } = req.body;
        const cart = await CartService.updateCartItem(req.store.id, sessionId, itemKey, quantity);
        res.json(cart);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const sessionId = getSessionId(req);
        if (!sessionId) return res.status(400).json({ message: 'Missing user context or x-session-id' });

        const { itemKey } = req.body; // or params
        const cart = await CartService.removeFromCart(req.store.id, sessionId, itemKey);
        res.json(cart);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const clearCart = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const sessionId = getSessionId(req);
        if (!sessionId) return res.status(400).json({ message: 'Missing user context or x-session-id' });

        await CartService.clearCart(req.store.id, sessionId);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
