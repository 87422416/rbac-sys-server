import express, { Request, Response, NextFunction } from "express";
import config from "./config";
import router from "./routes";
import swaggerUi from "swagger-ui-express";
// @ts-ignore
import swaggerDocs from "./swagger/swagger-output.json";
import { morganLogger } from "./logger/morgan";
import { v4 as uuidv4 } from "uuid";
import { errorLogger } from "./logger/winston";
import { resBodyBuilder } from "./utils";
import passport from "passport";
import session from "express-session";
import { redisClient } from "./db";
import { RedisStore } from "connect-redis";

const { PORT, SESSION_SECRET_KEY, COOKIE_OPTIONS } = config;

const app = express();

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "rbac-sys:",
});

app.use(
  session({
    store: redisStore,
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      signed: COOKIE_OPTIONS.signed,
      sameSite: COOKIE_OPTIONS.sameSite,
      secure: COOKIE_OPTIONS.secure,
      maxAge: COOKIE_OPTIONS.maxAge,
    },
  })
);

// 初始化 passport
app.use(passport.initialize());

if (process.env.NODE_ENV === "development") {
  // 设置 Swagger UI 来展示文档
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// 生成并附加 traceId 的中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  req.traceId = uuidv4();
  next();
});

// 使用 morgan 中间件记录 HTTP 请求
app.use(morganLogger);

// 解析请求体
app.use(express.json());

// 挂载路由
app.use("/api", router);

// 错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorLogger.error(
    `traceId: ${req.traceId} | message: ${err.message} | stack: ${err.stack}`
  );

  const errorMsg =
    process.env.NODE_ENV === "development" ? err.message : "服务端错误";

  res.status(500).json(resBodyBuilder(null, errorMsg, -1));
});

export function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
