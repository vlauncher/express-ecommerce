import redisClient from '../config/redis';

export class CartService {
    private static getCartKey(storeId: string, userIdOrSessionId: string) {
        return `cart:${storeId}:${userIdOrSessionId}`;
    }

    static async addToCart(storeId: string, userIdOrSessionId: string, item: { productId: string; variantId?: string; quantity: number }) {
        const key = this.getCartKey(storeId, userIdOrSessionId);
        
        // Structure: Hash map where field is "productId:variantId" and value is quantity (or JSON with more details)
        // For simplicity, let's store JSON string of the item details
        const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : `${item.productId}`;
        
        // Get existing
        const existing = await redisClient.hGet(key, itemKey);
        let currentItem = existing ? JSON.parse(existing) : { ...item, quantity: 0 };
        
        currentItem.quantity += item.quantity;
        
        await redisClient.hSet(key, itemKey, JSON.stringify(currentItem));
        
        // Set expiry (e.g., 7 days)
        await redisClient.expire(key, 60 * 60 * 24 * 7); 
        
        return await this.getCart(storeId, userIdOrSessionId);
    }

    static async getCart(storeId: string, userIdOrSessionId: string) {
        const key = this.getCartKey(storeId, userIdOrSessionId);
        const allItems = await redisClient.hGetAll(key);
        
        return Object.values(allItems).map((i: string) => JSON.parse(i));
    }

    static async updateCartItem(storeId: string, userIdOrSessionId: string, itemKey: string, quantity: number) {
        const key = this.getCartKey(storeId, userIdOrSessionId);
        const existing = await redisClient.hGet(key, itemKey);
        
        if (!existing) throw new Error('Item not in cart');
        
        if (quantity <= 0) {
            await redisClient.hDel(key, itemKey);
        } else {
            const currentItem = JSON.parse(existing);
            currentItem.quantity = quantity;
            await redisClient.hSet(key, itemKey, JSON.stringify(currentItem));
        }
        
        return await this.getCart(storeId, userIdOrSessionId);
    }

    static async removeFromCart(storeId: string, userIdOrSessionId: string, itemKey: string) {
        const key = this.getCartKey(storeId, userIdOrSessionId);
        await redisClient.hDel(key, itemKey);
        return await this.getCart(storeId, userIdOrSessionId);
    }

    static async clearCart(storeId: string, userIdOrSessionId: string) {
        const key = this.getCartKey(storeId, userIdOrSessionId);
        await redisClient.del(key);
    }
}
