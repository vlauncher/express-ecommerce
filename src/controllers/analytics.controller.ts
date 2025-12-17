import { Request, Response } from 'express';
import { Order, OrderItem, Product, OrderStatus } from '../models';
import { Sequelize } from 'sequelize';

export const getSalesStats = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const storeId = req.store.id;

        const totalRevenue = await Order.sum('totalAmount', {
            where: { storeId, status: OrderStatus.PAID }
        });

        const totalOrders = await Order.count({
            where: { storeId, status: OrderStatus.PAID }
        });

        res.json({ 
            totalRevenue: totalRevenue || 0, 
            totalOrders 
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTopProducts = async (req: Request, res: Response) => {
    try {
        if (!req.store) return res.status(400).json({ message: 'Store context missing' });
        const storeId = req.store.id;

        const topProducts = await OrderItem.findAll({
            attributes: [
                'productId',
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold']
            ],
            include: [{
                model: Order,
                as: 'order',
                attributes: [],
                where: { storeId, status: OrderStatus.PAID }
            }, {
                model: Product,
                as: 'product',
                attributes: ['name', 'imageUrl']
            }],
            group: ['productId', 'product.id'],
            order: [[Sequelize.literal('totalSold'), 'DESC']],
            limit: 5
        });

        res.json(topProducts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
