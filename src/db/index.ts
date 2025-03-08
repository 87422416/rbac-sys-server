import { Sequelize } from "@sequelize/core";
import config from "../config";
import models from "../models/index";
import { MySqlDialect } from "@sequelize/mysql";
import { createClient } from "redis";

const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } = config;

export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: DB_NAME,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  models,
  timezone: "+08:00",
  define: {
    underscored: true, // 全局启用下划线命名规则
  },
});

export const redisClient = createClient({ url: config.REDIS_URL });

export async function initDB() {
  await sequelize.authenticate().catch((err) => {
    console.error("数据库连接失败", err);
  });
  console.log("数据库连接成功");
  await sequelize.sync({ force: true }).catch((err) => {
    console.error("数据库表同步失败", err);
  });
  console.log("数据库表同步成功");

  await redisClient.connect().catch((err) => {
    console.error("Redis 连接失败", err);
  });
  console.log("Redis 连接成功");
}
