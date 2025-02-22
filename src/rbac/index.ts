import { SequelizeAdapter } from "casbin-sequelize-adapter";
import * as casbin from "casbin";
import config from "@/config";
import path from "path";

const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } = config;

let rbacEnforcer: casbin.Enforcer | null = null;
let menuEnforcer: casbin.Enforcer | null = null;

async function getAdapter() {
  try {
    // 创建 Casbin 的 Sequelize 适配器
    const adapter = await SequelizeAdapter.newAdapter({
      dialect: "mysql",
      database: DB_NAME,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    });
    return adapter;
  } catch (error) {
    console.error("Error initializing Sequelize adapter:", error);
    throw error;
  }
}

// 统一的初始化函数，接收不同的模型文件和配置
async function initEnforcer(modelFile: string) {
  try {
    const enforcer = rbacEnforcer;
    if (enforcer) {
      // 加载策略
      await enforcer.loadPolicy();
      console.log(`rbacEnforcer loaded successfully`);
      return;
    }

    const newEnforcer = await casbin.newEnforcer(
      path.resolve(__dirname, modelFile),
      await getAdapter()
    );

    // 加载策略
    await newEnforcer.loadPolicy();

    rbacEnforcer = newEnforcer;
    console.log("RBAC enforcer initialized successfully");
  } catch (error) {
    console.error(`Error initializing rbacEnforcer:`, error);
  }
}

// 针对 RBAC 和 Menu 调用的函数
export async function initRBACEnforcer() {
  await initEnforcer("rbac_model.conf");
}

export function getRBACEnforcer() {
  if (!rbacEnforcer) {
    throw new Error("RBAC enforcer not initialized");
  }
  return rbacEnforcer;
}
