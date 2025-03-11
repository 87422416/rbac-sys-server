import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  const { captcha } = req.body;
  if (captcha !== req.session.captcha) {
    return next(new Error("验证码错误"));
  }

  req.session.captcha = "";
  next();
};
