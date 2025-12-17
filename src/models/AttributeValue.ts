import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface AttributeValueAttributes {
  id: string;
  attributeId: string;
  value: string; // e.g., "Red", "Blue", "Small"
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttributeValueCreationAttributes extends Optional<AttributeValueAttributes, 'id'> {}

class AttributeValue extends Model<AttributeValueAttributes, AttributeValueCreationAttributes> implements AttributeValueAttributes {
  public id!: string;
  public attributeId!: string;
  public value!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AttributeValue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    attributeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'attribute_values',
  }
);

export default AttributeValue;
