import { Order, OrderItem, Product, ProductVariant, Address, Store, OrderStatus, User } from '../models';
import { CartService } from './cart.service';
import { PaymentService } from './payment.service';
import { sequelize } from '../database';

export class OrderService {
    static async createOrder(
        storeId: string, 
        userId: number | undefined, 
        sessionId: string,
        addressData: any
    ) {
        // 1. Get Cart
        const cartItems = await CartService.getCart(storeId, sessionId);
        if (cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        const transaction = await sequelize.transaction();

        try {
            // 2. Validate Stock & Calculate Total
            let totalAmount = 0;
            const orderItemsData = [];

            for (const item of cartItems) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (!product) throw new Error(`Product ${item.productId} not found`);

                let price = product.basePrice;
                let stock = 0;
                let variant = null;

                if (item.variantId) {
                    variant = await ProductVariant.findByPk(item.variantId, { transaction });
                    if (!variant) throw new Error(`Variant ${item.variantId} not found`);
                    stock = variant.stockQuantity;
                    if (variant.specificPrice) price = variant.specificPrice;
                } else {
                    // Assuming products without variants don't track stock directly on Product model in this schema 
                    // OR we need to add stock to Product. For now, let's assume infinite or check later.
                    // Implementation Detail: Product model didn't have stockQuantity. 
                    // Let's assume for this MVF that only variants track stock or we skip stock check for base products.
                    // Or ideally, add stock to Product model.
                    // I will skip strict stock check for base products without variants for now to keep it simple,
                    // or assume 100.
                    stock = 100; 
                }

                if (stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }

                // Deduct Stock
                if (variant) {
                    await variant.update({ stockQuantity: stock - item.quantity }, { transaction });
                }
                
                totalAmount += Number(price) * item.quantity;
                orderItemsData.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: Number(price),
                });
            }

            // 3. Create Address
            let address;
            if (addressData.id) {
                address = await Address.findByPk(addressData.id, { transaction });
                if (!address) throw new Error('Address not found');
            } else {
                address = await Address.create({ ...addressData, userId }, { transaction });
            }

            // 4. Create Order
            const order = await Order.create({
                storeId,
                userId,
                addressId: address.id,
                totalAmount,
                status: OrderStatus.PENDING
            }, { transaction });

            // 5. Create Order Items
            for (const itemData of orderItemsData) {
                await OrderItem.create({
                    orderId: order.id,
                    ...itemData
                }, { transaction });
            }

            // 6. Initialize Paystack Transaction
            let customerEmail = 'guest@example.com';
            if (userId) {
                const user = await User.findByPk(userId, { transaction });
                if (user) customerEmail = user.email;
            } else if (addressData.email) {
                customerEmail = addressData.email;
            }

            const paystackResponse = await PaymentService.initializeTransaction(
                customerEmail, 
                totalAmount, 
                { orderId: order.id, storeId }
            );
            
            await order.update({ paymentReference: paystackResponse.reference }, { transaction });

            // 7. Clear Cart
            await CartService.clearCart(storeId, sessionId);

            await transaction.commit();

            return { order, authorizationUrl: paystackResponse.authorization_url, reference: paystackResponse.reference };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getOrders(storeId: string, userId?: number) {
        const where: any = { storeId };
        if (userId) where.userId = userId;

        return await Order.findAll({
            where,
            include: [
                { model: OrderItem, as: 'items', include: ['product', 'variant'] },
                { model: Address, as: 'shippingAddress' }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    static async getOrderById(id: string, storeId: string) {
        return await Order.findOne({
            where: { id, storeId },
            include: [
                { model: OrderItem, as: 'items', include: ['product', 'variant'] },
                { model: Address, as: 'shippingAddress' }
            ]
        });
    }

    static async updateOrderStatus(id: string, storeId: string, status: OrderStatus) {
        const order = await Order.findOne({ where: { id, storeId } });
        if (!order) throw new Error('Order not found');
        return await order.update({ status });
    }
}
