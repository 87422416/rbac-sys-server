import { resBodyBuilder } from "@/utils";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";

// 创建一个通用的验证中间件
export default (schema: Joi.ObjectSchema, position: keyof Request = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[position]);

    if (error) {
      const msg =
        process.env.NODE_ENV === "development"
          ? `${position as string}参数错误: ${error.message}`
          : "参数错误";
      next(new Error(msg));
      return;
    }

    next();
  };
};
