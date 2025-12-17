import User from './User';
import Otp from './Otp';
import Store from './Store';
import Category from './Category';
import Product from './Product';
import ProductVariant from './ProductVariant';
import Attribute from './Attribute';
import AttributeValue from './AttributeValue';
import Address from './Address';
import Order, { OrderStatus } from './Order';
import OrderItem from './OrderItem';

// Associations

// Store
Store.hasMany(User, { foreignKey: 'storeId', as: 'users' });
User.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Store.hasMany(Category, { foreignKey: 'storeId', as: 'categories' });
Category.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Store.hasMany(Product, { foreignKey: 'storeId', as: 'products' });
Product.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Store.hasMany(Attribute, { foreignKey: 'storeId', as: 'attributes' });
Attribute.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Store.hasMany(Order, { foreignKey: 'storeId', as: 'orders' });
Order.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// Category
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Product
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Attribute
Attribute.hasMany(AttributeValue, { foreignKey: 'attributeId', as: 'values' });
AttributeValue.belongsTo(Attribute, { foreignKey: 'attributeId', as: 'attribute' });

// User
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'shippingAddress' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

export { User, Otp, Store, Category, Product, ProductVariant, Attribute, AttributeValue, Address, Order, OrderItem, OrderStatus };
