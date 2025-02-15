import User from "@/models/user";
import config from "@/config";
import bcrypt from "bcrypt";
import { InferAttributes } from "@sequelize/core/_non-semver-use-at-your-own-risk_/model.js";
import { Op } from "@sequelize/core";

const { CRYPT_SALT } = config;

export default class UserService {
  static async createUser(user: InferAttributes<User>) {
    const salt = await bcrypt.genSalt(CRYPT_SALT);

    return User.create({
      ...user,
      password: await bcrypt.hash(user.password, salt),
    });
  }

  static async getUsersByPage(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    return User.findAndCountAll({
      attributes: { exclude: ["password", "failedLoginAttempts"] },
      offset,
      limit: pageSize,
    });
  }

  static async getUserById(id: number) {
    return User.findByPk(id, {
      attributes: { exclude: ["password", "failedLoginAttempts"] },
    });
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
}
