import User from "../models/user";
import config from "../config";
import bcrypt from "bcrypt";
import { InferAttributes } from "@sequelize/core/_non-semver-use-at-your-own-risk_/model.js";
import { Op } from "@sequelize/core";
import { getRBACEnforcer } from "../rbac";
import _ from "lodash";
import { generateWhereOptions } from "../utils";
import dayjs from "dayjs";
import { sequelize } from "../db";
import { RoleService } from "./roleService";
const { CRYPT_SALT } = config;

export default class UserService {
  static async createUser(user: InferAttributes<User> & { roles?: string[] }) {
    const existUser = await User.findOne({
      where: { username: user.username },
    });

    if (existUser) {
      throw new Error("用户已存在");
    }
    
    const salt = await bcrypt.genSalt(CRYPT_SALT);

    return sequelize.transaction(async () => {
      const res = await User.create({
        ...user,
        menu: JSON.stringify(user.menu),
        password: await bcrypt.hash(user.password, salt),
      });
      console.log("createUser", res.id, user.roles);
      await RoleService.assignRolesToUser(res.id as number, user.roles || []);
    });
  }

  static async getUsersByPage(
    page: number,
    pageSize: number,
    whereOptions: { [k in keyof InferAttributes<User>]?: any } & {
      [key: string]: any;
    }
  ) {
    const offset = (page - 1) * pageSize;

    let options = generateWhereOptions(
      whereOptions,
      (obj) => ({
        ...obj,
        username: obj.username ? { [Op.like]: `%${obj.username}%` } : undefined,
        email: obj.email ? { [Op.like]: `%${obj.email}%` } : undefined,
        phone: obj.phone ? { [Op.like]: `%${obj.phone}%` } : undefined,
        failedLoginAttempts: obj.failedLoginAttempts
          ? { [Op.gte]: obj.failedLoginAttempts }
          : undefined,
        ...(obj.unlockTimeStart &&
          obj.unlockTimeEnd && {
            unlockTime: {
              [Op.gte]: obj.unlockTimeStart,
              [Op.lt]: dayjs(obj.unlockTimeEnd).endOf("day").toDate(),
            },
          }),
        ...(obj.lastLoginTimeStart &&
          obj.lastLoginTimeEnd && {
            lastLoginTime: {
              [Op.gte]: obj.lastLoginTimeStart,
              [Op.lt]: dayjs(obj.lastLoginTimeEnd).endOf("day").toDate(),
            },
          }),
        ...(obj.createdAtStart &&
          obj.createdAtEnd && {
            createdAt: {
              [Op.gte]: obj.createdAtStart,
              [Op.lt]: dayjs(obj.createdAtEnd).endOf("day").toDate(),
            },
          }),
        ...(obj.updatedAtStart &&
          obj.updatedAtEnd && {
            updatedAt: {
              [Op.gte]: obj.updatedAtStart,
              [Op.lt]: dayjs(obj.updatedAtEnd).endOf("day").toDate(),
            },
          }),
      }),
      [
        "lastLoginTimeStart" as never,
        "lastLoginTimeEnd" as never,
        "unlockTimeStart" as never,
        "unlockTimeEnd" as never,
        "createdAtStart" as never,
        "createdAtEnd" as never,
        "updatedAtStart" as never,
        "updatedAtEnd" as never,
      ]
    );

    return User.findAndCountAll({
      attributes: { exclude: ["password"] },
      offset,
      limit: pageSize,
      where: options,
    });
  }

  static async getUserById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "failedLoginAttempts"] },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    // 获取用户角色
    const roles = await this.getUserRoles(id);

    // 返回用户数据并添加roles属性
    return {
      ...user.get(),
      roles,
    };
  }

  static async updateUser(
    id: number,
    user: Partial<InferAttributes<User>> & {
      menu?: string[];
      roles?: string[];
    }
  ) {
    const salt = await bcrypt.genSalt(CRYPT_SALT);
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    await sequelize.transaction(async () => {
      // 更新用户角色
      await RoleService.assignRolesToUser(id, user.roles || []);

      await User.update(
        {
          ...user,
          menu: JSON.stringify(user.menu),
        },
        {
          where: { id },
        }
      );
    });
  }

  static async deleteUsers(ids: number[]) {
    const rbacEnforcer = await getRBACEnforcer();
    // 加载策略
    await rbacEnforcer.loadPolicy();
    // 删除用户角色
    const roles = await Promise.all(
      ids.map(async (id) => {
        return rbacEnforcer.deleteRolesForUser(`user::${id}`);
      })
    );
    
    if (roles.every(Boolean)) {
      throw new Error("删除用户角色失败");
    }
    
    return User.destroy({
      where: { id: { [Op.in]: ids } },
    });
  }

  static async getUserRoles(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "failedLoginAttempts"] },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    const rbacEnforcer = await getRBACEnforcer();
    // 加载策略
    await rbacEnforcer.loadPolicy();
    // 获取用户角色
    const roles = await rbacEnforcer.getRolesForUser(`user::${id}`);
    return roles?.map((role) => role.split("role::")[1]);
  }

  static async handleTimeOutUnlockedUsers() {
    const users = await User.findAll({
      where: { unlockTime: { [Op.ne]: null } },
    });

    console.log(users, "解锁用户");

    const resetFn = async (user: User) => {
      user.unlockTime = null;
      user.status = "inactive";
      user.failedLoginAttempts = 0;
      await user.save(); // 保存修改后的 user 实例
    };

    for (const user of users) {
      const diffTime = dayjs(user.unlockTime).diff(dayjs(), "milliseconds");

      if (diffTime < 0) {
        // 如果差值小于等于 0，立即设置 unlockTime 为 null 并保存
        await resetFn(user);
        continue;
      }
      // 如果差值大于 0，使用 setTimeout 延迟设置 unlockTime 为 null
      setTimeout(async () => {
        await resetFn(user);
        console.log(user.username, diffTime, "解锁");
      }, diffTime);
    }
  }
}
