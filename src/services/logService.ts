import config from "../config";
import User from "../models/user";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";

const { JWT_SECRET_KEY, JWT_OPTIONS } = config;

export default class LogService {
  static async login(
    username: string,
    password: string,
    info: { lastLoginIp?: string }
  ): Promise<string> {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error("账号错误");
    }

    // 验证账号状态
    if (user.status === "locked") {
      throw new Error("账号已被封禁");
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("密码错误");
    }

    // 生成token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET_KEY,
      JWT_OPTIONS
    );

    try {
      // 更新账号信息
      await this.updateUserInfo(user.id as number, {
        lastLoginTime: dayjs().locale("zh-cn").toDate(),
        lastLoginIp: info.lastLoginIp,
        status: "active",
      });
    } catch (error) {
      throw error;
    }

    return token;
  }

  static async updateUserInfo(id: number, userInfo: Partial<User>) {
    return User.update(userInfo, { where: { id } });
  }
}
