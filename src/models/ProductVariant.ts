import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface ProductVariantAttributes {
  id: string;
  productId: string;
  sku: string;
  stockQuantity: number;
  specificPrice?: number;
  attributes: Record<string, any>; // JSON blob for specific attributes like { color: 'red', size: 'M' }
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductVariantCreationAttributes extends Optional<ProductVariantAttributes, 'id'> {}

class ProductVariant extends Model<ProductVariantAttributes, ProductVariantCreationAttributes> implements ProductVariantAttributes {
  public id!: string;
  public productId!: string;
  public sku!: string;
  public stockQuantity!: number;
  public specificPrice!: number;
  public attributes!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductVariant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    specificPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'product_variants',
  }
);

export default ProductVariant;
