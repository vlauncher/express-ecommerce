import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface AddressAttributes {
  id: string;
  userId?: number; // Optional: Guest checkout
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AddressCreationAttributes extends Optional<AddressAttributes, 'id' | 'userId'> {}

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  public id!: string;
  public userId!: number | undefined;
  public street!: string;
  public city!: string;
  public state!: string;
  public zip!: string;
  public country!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'addresses',
  }
);

export default Address;
