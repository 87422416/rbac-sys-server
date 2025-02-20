import { initDB } from "@/db";
import { startServer } from "@/app";
import { initRBACEnforcer, initMenuEnforcer } from "@/rbac";
import mock from "./mock";

(async () => {
  // 初始化数据库
  await initDB();

  // 初始化 RBAC 和 Menu 模型
  await initRBACEnforcer();
  await initMenuEnforcer();

  // 初始化 mock 数据
  await mock();

  // 启动服务
  startServer();
})();
