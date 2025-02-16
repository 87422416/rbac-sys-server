import LogService from "@/services/logService";
import { getErrorMessage, resBodyBuilder } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    const loginSuccess = await LogService.login(username, password, {
      lastLoginIp: req.ip,
    });

    res.setHeader("Authorization", loginSuccess);

    res.send(resBodyBuilder(null, "登录成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "登录失败";

    next(new Error(msg));
  }
};
