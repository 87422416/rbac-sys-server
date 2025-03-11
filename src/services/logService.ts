import dayjs from "dayjs";
import User from "../models/user";
import bcrypt from "bcrypt";
import config from "../config";
import { rebuildTree } from "../utils";
import { menu as menuOrigin } from "../constant/menu";
import { getRBACEnforcer } from "../rbac";

const { ADMIN_MAX_LOGIN_ATTEMPT, ADMIN_LOCK_TIME } = config;

export default class LogService {
  static async login(username: string, password: string): Promise<User> {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new Error("账号错误");
    }

    // 验证账号状态
    if (user.status === "locked") {
      if (dayjs(user.unlockTime).isBefore(dayjs())) {
        user.unlockTime = null;
        user.status = "inactive";
        user.failedLoginAttempts = 0;
        await user.save();
      } else {
        throw new Error(
          `账号已被封禁，请在${dayjs(user.unlockTime).format(
            "YYYY-MM-DD HH:mm:ss"
          )}后尝试`
        );
      }
    }

    // 判断是否超过最大尝试次数
    // @ts-ignore
    if (user.failedLoginAttempts >= ADMIN_MAX_LOGIN_ATTEMPT) {
      const unlockTime = dayjs()
        .add(ADMIN_LOCK_TIME / 1000, "seconds")
        .toDate();

      await User.update(
        { unlockTime, status: "locked" },
        { where: { username } }
      );

      throw new Error(
        `登录次数过多，请在${dayjs(unlockTime).format(
          "YYYY-MM-DD HH:mm:ss"
        )}后尝试`
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await User.increment("failedLoginAttempts", {
        where: { username },
      });

      throw new Error("密码错误");
    }

    return user;
  }

  static async whoami(userId: string) {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("用户不存在");
    }

    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();

    const permissions =
      (
        await rbacEnforcer.getImplicitPermissionsForUser(`user::${user.id}`)
      ).map((item) => `${item[1].split("::")[1]}::${item[2].split("::")[1]}`) ||
      [];

    const menu = rebuildTree(menuOrigin, JSON.parse(user?.menu || "[]"));

    return {
      username: user?.username,
      avatar: user?.avatar,
      menu,
      permissions,
    };
  }
}
