import { initDB } from "@/db";

import { startServer } from "@/app";

(async () => {
  // 初始化数据库
  await initDB();
  // 启动服务
  startServer();
})();
