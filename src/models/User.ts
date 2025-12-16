import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface UserAttributes {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  is_verified: boolean;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'CUSTOMER';
  storeId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'is_verified'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public password!: string;
  public is_verified!: boolean;
  public role!: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'CUSTOMER';
  public storeId?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM('SUPER_ADMIN', 'STORE_ADMIN', 'CUSTOMER'),
      defaultValue: 'CUSTOMER',
      allowNull: false,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'stores',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
