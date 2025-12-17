import { Category } from '../models';

export class CategoryService {
    static async createCategory(data: { name: string; parentId?: string; storeId: string }) {
        return await Category.create(data);
    }

    static async getCategories(storeId: string) {
        const categories = await Category.findAll({
            where: { storeId },
            include: [{ model: Category, as: 'subcategories' }],
        });
        
        // Filter to return only root categories (those without parent) in the top level list
        // but since we include subcategories, we might want a tree structure.
        // For now, let's return all root categories with their children.
        return categories.filter(c => !c.parentId);
    }

    static async getCategoryById(id: string, storeId: string) {
        return await Category.findOne({
            where: { id, storeId },
            include: [{ model: Category, as: 'subcategories' }, { model: Category, as: 'parent' }],
        });
    }

    static async updateCategory(id: string, storeId: string, data: Partial<{ name: string; parentId: string }>) {
        const category = await Category.findOne({ where: { id, storeId } });
        if (!category) throw new Error('Category not found');
        return await category.update(data);
    }

    static async deleteCategory(id: string, storeId: string) {
        const category = await Category.findOne({ where: { id, storeId } });
        if (!category) throw new Error('Category not found');
        return await category.destroy();
    }
}
