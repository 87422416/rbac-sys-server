import dayjs from "dayjs";
import User from "../../models/user";
import LogService from "../../services/logService";
import { getErrorMessage, resBodyBuilder } from "../../utils";
import { NextFunction, Request, Response } from "express";
import config from "src/config";
import jwt from "jsonwebtoken";

const { JWT_SECRET_KEY, JWT_OPTIONS } = config;

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['log']
  try {
    const { username, password } = req.body;

    const user = await LogService.login(username, password);

    // 生成token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET_KEY,
      JWT_OPTIONS
    );

    // 更新账号信息
    await User.update(
      {
        lastLoginTime: dayjs().locale("zh-cn").toDate(),
        lastLoginIp: req.ip,
        status: "active",
      },
      { where: { username } }
    );

    res.setHeader("Authorization", token);

    res.send(resBodyBuilder(null, "登录成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "登录失败";

    next(new Error(msg));
  }
};
