import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import {
  Attribute,
  NotNull,
  PrimaryKey,
  Table,
  AutoIncrement,
  Unique,
} from "@sequelize/core/decorators-legacy";

@Table({
  paranoid: true,
  createdAt: true,
  deletedAt: true,
  updatedAt: true,
})
export default class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id?: number;

  @Attribute(DataTypes.STRING)
  @Unique
  @NotNull
  declare label: string;
}
