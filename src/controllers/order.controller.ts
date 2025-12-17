import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../models/Order';

const getSessionId = (req: Request) => {
    if (req.user) return req.user.id.toString();
    const sessionId = req.headers['x-session-id'] as string;
    return sessionId;
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const sessionId = getSessionId(req);
        if (!sessionId) return res.status(400).json({ message: 'Missing user context or x-session-id' });

        const { address } = req.body;
        const result = await OrderService.createOrder(req.store.id, req.user?.id, sessionId, address);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        
        // If user is admin, they might want to see all orders (filtered), otherwise only their own.
        // For now, let's assume this endpoint is for logged-in users to see their history.
        // Store Admin endpoint should probably be separate or protected by role check here.
        
        let userId = req.user?.id;
        
        // If STORE_ADMIN, they can see all orders for the store
        if (req.user?.role === 'STORE_ADMIN') {
            userId = undefined; 
        } else if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const orders = await OrderService.getOrders(req.store.id, userId);
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        
        const order = await OrderService.getOrderById(req.params.id, req.store.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Security check: Only owner or admin can view
        if (req.user?.role !== 'STORE_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
             if (order.userId !== req.user?.id) {
                 return res.status(403).json({ message: 'Access denied' });
             }
        }

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const { status } = req.body;
        
        if (!Object.values(OrderStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await OrderService.updateOrderStatus(req.params.id, req.store.id, status);
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
