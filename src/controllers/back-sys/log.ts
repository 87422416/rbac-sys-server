import dayjs from "dayjs";
import User from "../../models/user";
import LogService from "../../services/logService";
import { getErrorMessage, resBodyBuilder } from "../../utils";
import { NextFunction, Request, Response } from "express";
import config from "../../config";
import jwt from "jsonwebtoken";
import svgCaptcha from "svg-captcha";

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

export const capcha = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['log']
  try {
    const capcha = svgCaptcha.create();
    req.session.captcha = capcha.text;

    if (process.env.NODE_ENV === "development") {
      console.log("capcha", capcha.text);
    }

    res.send(resBodyBuilder(capcha.data, "验证码生成成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "验证码生成失败";
    next(new Error(msg));
  }
};
