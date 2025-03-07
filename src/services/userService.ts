import User from "../models/user";
import config from "../config";
import bcrypt from "bcrypt";
import { InferAttributes } from "@sequelize/core/_non-semver-use-at-your-own-risk_/model.js";
import { Op } from "@sequelize/core";
import { getRBACEnforcer } from "../rbac";
import _ from "lodash";
import { generateWhereOptions } from "../utils";
import dayjs from "dayjs";
const { CRYPT_SALT } = config;

export default class UserService {
  static async createUser(user: InferAttributes<User>) {
    const salt = await bcrypt.genSalt(CRYPT_SALT);

    return User.create({
      ...user,
      password: await bcrypt.hash(user.password, salt),
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

    let options = generateWhereOptions(whereOptions, (obj) => ({
      ...obj,
      username: obj.username ? { [Op.like]: `%${obj.username}%` } : undefined,
      email: obj.email ? { [Op.like]: `%${obj.email}%` } : undefined,
      phone: obj.phone ? { [Op.like]: `%${obj.phone}%` } : undefined,
      ...(obj.createdAtStart &&
        obj.createdAtEnd && {
          createdAt: {
            [Op.between]: [obj.createdAtStart, obj.createdAtEnd],
          },
        }),
      ...(obj.updatedAtStart &&
        obj.updatedAtEnd && {
          updatedAt: {
            [Op.between]: [obj.updatedAtStart, obj.updatedAtEnd],
          },
        }),
    }));

    return User.findAndCountAll({
      attributes: { exclude: ["password", "failedLoginAttempts"] },
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

  static async updateUser(id: number, user: Partial<InferAttributes<User>>) {
    const salt = await bcrypt.genSalt(CRYPT_SALT);
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    return User.update(user, {
      where: { id },
    });
  }

  static async deleteUsers(ids: number[]) {
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
