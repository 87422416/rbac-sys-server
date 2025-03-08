import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

export default {
  // 系统相关
  PORT: process.env.PORT || 8899,
  ADMIN_MAX_LOGIN_ATTEMPT: process.env.ADMIN_MAX_LOGIN_ATTEMPT || 5,
  ADMIN_LOCK_TIME:
    process.env.ADMIN_LOCK_TIME && eval(process.env.ADMIN_LOCK_TIME)
      ? eval(process.env.ADMIN_LOCK_TIME)
      : 1 * 1 * 6 * 1000,

  // 分页相关
  PAGE_SIZE: (process.env.PAGE_SIZE && parseInt(process.env.PAGE_SIZE)) || 10,

  // Session
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY || "ewrcsxvz",

  // Cookie
  COOKIE_OPTIONS: {
    httpOnly: process.env.COOKIE_OPTIONS_HTTP_ONLY === "true",
    signed: process.env.COOKIE_OPTIONS_SIGNED === "true",
    sameSite: process.env.COOKIE_OPTIONS_SAME_SITE === "true",
    secure: process.env.COOKIE_OPTIONS_SECURE === "true",
    maxAge:
      process.env.COOKIE_OPTIONS_MAX_AGE &&
      eval(process.env.COOKIE_OPTIONS_MAX_AGE)
        ? eval(process.env.COOKIE_OPTIONS_MAX_AGE)
        : 1000 * 60 * 60 * 24,
  },

  // jwt
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "werzxcvawdr1234",
  JWT_OPTIONS: {
    expiresIn:
      process.env.JWT_OPTIONS_EXPIRES_IN &&
      eval(process.env.JWT_OPTIONS_EXPIRES_IN)
        ? eval(process.env.JWT_OPTIONS_EXPIRES_IN)
        : 1 * 1 * 6 * 1000,
  },

  // 加密相关
  CRYPT_SALT: process.env.CRYPT_SALT ? parseInt(process.env.CRYPT_SALT) : 13,

  // 数据库相关
  DB_NAME: process.env.DB_NAME || "rbac_sys",
  DB_USERNAME: process.env.DB_USERNAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,

  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // 日志相关
  //  INFO级别 日志
  LOG_INFO_FILE_NAME: process.env.LOG_INFO_FILE_NAME || "app-info-%DATE%.log",
  LOG_INFO_DATE_PATTERN: process.env.LOG_INFO_DATE_PATTERN || "YYYY-MM-DD",
  LOG_INFO_DIRNAME: process.env.LOG_INFO_DIRNAME || "logs/info",
  LOG_INFO_ZIPPED_ARCHIVE: process.env.LOG_INFO_ZIPPED_ARCHIVE === "true",
  LOG_INFO_MAX_FILES: process.env.LOG_INFO_MAX_FILES || "90d",

  //  ERROR级别 日志
  LOG_ERROR_FILE_NAME:
    process.env.LOG_ERROR_FILE_NAME || "app-error-%DATE%.log",
  LOG_ERROR_DATE_PATTERN: process.env.LOG_ERROR_DATE_PATTERN || "YYYY-MM-DD",
  LOG_ERROR_DIRNAME: process.env.LOG_ERROR_DIRNAME || "logs/error",
  LOG_ERROR_ZIPPED_ARCHIVE: process.env.LOG_ERROR_ZIPPED_ARCHIVE === "true",
  LOG_ERROR_MAX_FILES: process.env.LOG_ERROR_MAX_FILES || "90d",
};
