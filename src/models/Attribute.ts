import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface AttributeAttributes {
  id: string;
  name: string; // e.g., "Color", "Size"
  storeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttributeCreationAttributes extends Optional<AttributeAttributes, 'id'> {}

class Attribute extends Model<AttributeAttributes, AttributeCreationAttributes> implements AttributeAttributes {
  public id!: string;
  public name!: string;
  public storeId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attribute.init(
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
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'attributes',
  }
);

export default Attribute;
