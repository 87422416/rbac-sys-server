import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import {
  Attribute,
  Default,
  NotNull,
  PrimaryKey,
  Comment,
  Table,
  AutoIncrement,
  ColumnName,
  Unique,
  AllowNull,
} from "@sequelize/core/decorators-legacy";

@Table({
  paranoid: true,
  createdAt: true,
  deletedAt: true,
  updatedAt: true,
})
export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id?: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  declare username: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare password: string;

  @Attribute(DataTypes.STRING)
  declare email?: string | null;

  @Attribute(DataTypes.STRING)
  declare phone?: string | null;

  @Attribute(DataTypes.STRING)
  @Comment("头像地址")
  declare avatar?: string | null;

  @Attribute(DataTypes.ENUM("active", "inactive", "locked"))
  @Default("inactive")
  @Comment("账号状态")
  declare status?: "active" | "inactive" | "locked";

  @Attribute(DataTypes.DATE)
  @Comment("最后登录日期")
  declare lastLoginTime?: Date | null;

  @Attribute(DataTypes.INTEGER)
  @Default(0)
  @Comment("登录失败次数")
  declare failedLoginAttempts?: number;

  @Attribute(DataTypes.STRING)
  @Comment("最后登录ip")
  declare lastLoginIp?: string | null;

  @Attribute(DataTypes.DATE)
  @Comment("解除封禁时间")
  declare unlockTime?: Date | null;

  @Attribute(DataTypes.JSON)
  @Comment("菜单")
  declare menu: string;
}
