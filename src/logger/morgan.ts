import morgan from "morgan";
import { Request } from "express";
import _ from "lodash";
import dayjs from "dayjs";
import { infoLogger } from "./winston";

// 自定义 morgan 日志格式
morgan.token("params", (req: Request) => {
  const params = req.params;
  return _.isEmpty(params) ? "-" : JSON.stringify(params);
});
morgan.token("body", (req: Request) => {
  const body = req.body;
  return _.isEmpty(body) ? "-" : JSON.stringify(body);
});
morgan.token("query", (req: Request) => {
  const query = req.query;
  return _.isEmpty(query) ? "-" : JSON.stringify(query);
});
morgan.token("ip", (req: Request) => req.ip);
morgan.token("referer", (req: Request) => req.headers.referer || "-");
morgan.token("beijingTime", () => {
  return dayjs().locale("zh-cn").format("YYYY-MM-DD HH:mm:ss");
});
morgan.token("traceId", (req: Request) => req.traceId || "-");

const customFormat =
  "时间: :beijingTime | traceId: :traceId | IP: :ip | 方法: :method | 路径: :url | 查询参数: :query | 路径参数: :params | 请求体: :body | 响应状态: :status | 来源: :referer";

export const morganLogger = morgan(customFormat, {
  stream: {
    write: (message) => {
      infoLogger.info(message);
      console.info(message);
    },
  },
});