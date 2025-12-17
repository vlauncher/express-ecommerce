import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface OrderItemAttributes {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number; // Price at the time of purchase
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'variantId'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public orderId!: string;
  public productId!: string;
  public variantId!: string | undefined;
  public quantity!: number;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'order_items',
  }
);

export default OrderItem;
