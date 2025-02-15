import type { ResBody } from "@/types/global";
import { ValidationError } from "@sequelize/core/_non-semver-use-at-your-own-risk_/errors/validation-error.js";
import config from "@/config";
import Joi from "joi";

const { PAGE_SIZE } = config;

/**
 * 构建响应体
 * @param data 响应数据
 * @param msg 响应消息
 * @param code 响应状态码
 * @returns 响应体
 */
export function resBodyBuilder(
  data: ResBody["data"],
  msg: ResBody["msg"],
  code: ResBody["code"] = 0
): ResBody {
  return { code, msg, data };
}

/**
 * 获取错误消息
 * @param error 错误对象
 * @returns 错误消息
 */
export function getErrorMessage(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    if (error instanceof ValidationError) {
      return `${error.errors[0].message}`;
    } else if (error instanceof Error) {
      return error.message;
    }
  }

  return null;
}

/**
 * 获取有效页码和页大小
 * @param page 页码
 * @param pageSize 页大小
 * @param defaultPage 默认页码
 * @param defaultPageSize 默认页大小
 * @returns 有效页码和页大小
 */
export const getValidPageAndSize = (
  page: any,
  pageSize: any,
  defaultPage: number = 1,
  defaultPageSize: number = PAGE_SIZE
) => {
  return {
    page: isNaN(+page) ? defaultPage : +page,
    pageSize: isNaN(+pageSize) ? defaultPageSize : +pageSize,
  };
};

/**
 * 获取id对象模式
 * @param msg 错误消息
 * @returns id对象模式
 */
export const getIdObjectSchema = (msg: string = "id格式不正确") =>
  Joi.object({
    id: Joi.number().required().label(msg),
  });

/**
 * 获取ids对象模式
 * @param msg 错误消息
 * @returns ids对象模式
 */
export const getIdsObjectSchema = (msg: string = "ids格式不正确") =>
  Joi.object({
    ids: Joi.string()
      .pattern(/^\d+(,\d+)*$/)
      .required()
      .label(msg),
  });
