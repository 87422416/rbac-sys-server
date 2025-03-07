import { initDB } from "./db";
import { startServer } from "./app";
import { initRBACEnforcer } from "./rbac";
import mock from "./mock";
import UserService from "./services/userService";

(async () => {
  // 初始化数据库
  await initDB();

  // 初始化用户延时解锁
  await UserService.handleTimeOutUnlockedUsers();

  // 初始化 RBAC 和 Menu 模型
  await initRBACEnforcer();

  // 初始化 mock 数据
  await mock();

  // 启动服务
  startServer();
})();
