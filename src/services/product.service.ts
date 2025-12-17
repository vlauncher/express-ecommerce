import { Product, ProductVariant } from '../models';
import { Op } from 'sequelize';

export class ProductService {
    static async createProduct(data: { name: string; description?: string; basePrice: number; storeId: string; categoryId?: string; imageUrl?: string }) {
        return await Product.create(data);
    }

    static async getProducts(storeId: string, query: { search?: string; categoryId?: string; minPrice?: number; maxPrice?: number }) {
        const where: any = { storeId };

        if (query.search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${query.search}%` } }, // Use iLike for Postgres if available, but 'like' is standard
                { description: { [Op.like]: `%${query.search}%` } },
            ];
        }

        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }

        if (query.minPrice || query.maxPrice) {
            where.basePrice = {};
            if (query.minPrice) where.basePrice[Op.gte] = query.minPrice;
            if (query.maxPrice) where.basePrice[Op.lte] = query.maxPrice;
        }

        return await Product.findAll({
            where,
            include: ['variants'],
        });
    }

    static async getProductById(id: string, storeId: string) {
        return await Product.findOne({
            where: { id, storeId },
            include: ['variants', 'category'],
        });
    }

    static async updateProduct(id: string, storeId: string, data: Partial<Product>) {
        const product = await Product.findOne({ where: { id, storeId } });
        if (!product) throw new Error('Product not found');
        return await product.update(data);
    }

    static async deleteProduct(id: string, storeId: string) {
        const product = await Product.findOne({ where: { id, storeId } });
        if (!product) throw new Error('Product not found');
        return await product.destroy();
    }

    static async createVariant(productId: string, storeId: string, data: { sku: string; stockQuantity: number; specificPrice?: number; attributes: any }) {
        const product = await Product.findOne({ where: { id: productId, storeId } });
        if (!product) throw new Error('Product not found');

        return await ProductVariant.create({
            productId,
            ...data
        });
    }
}
