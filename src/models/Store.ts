import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface StoreAttributes {
  id: string;
  name: string;
  slug: string; // unique identifier for subdomain/path
  domain?: string; // custom domain
  createdAt?: Date;
  updatedAt?: Date;
}

interface StoreCreationAttributes extends Optional<StoreAttributes, 'id'> {}

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public domain!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'stores',
  }
);

export default Store;
