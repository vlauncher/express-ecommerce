import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

interface OrderAttributes {
  id: string;
  storeId: string;
  userId?: number; // Optional for guest
  addressId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentReference?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'userId' | 'status' | 'paymentReference'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public storeId!: string;
  public userId!: number | undefined;
  public addressId!: string;
  public status!: OrderStatus;
  public totalAmount!: number;
  public paymentReference!: string | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
  }
);

export default Order;
