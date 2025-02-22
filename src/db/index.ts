import { Sequelize } from "@sequelize/core";
import config from "@/config";
import models from "@/models/index";
import { MySqlDialect } from "@sequelize/mysql";
// import event from "../utils/eventEmitter";

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

export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功");
    await sequelize.sync({ force: true });
    console.log("数据库表同步成功");
    // event.emit("dbReady");
  } catch (error) {
    if (error instanceof Error) {
      console.error("数据库连接失败", error.message);
    } else {
      console.error("数据库连接失败", error);
    }
  }
}
