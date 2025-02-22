import { getRBACEnforcer } from "../rbac";
import { Request, Response, NextFunction } from "express";
import router from "../routes/index";
import { ILayer } from "express-serve-static-core";
import _ from "lodash";

export default async (req: Request, res: Response, next: NextFunction) => {
  let { method, path } = req;

  const user = req.user;

  if (!user || !user.roles) {
    next(new Error("权限不足"));
    return;
  }

  const roles = user.roles;

  method = method.toLowerCase();

  // 遍历 router.stack 查找匹配的路由，按优先级顺序进行匹配
  const matchingRoute = findMatchingRoute(router, path, method);

  if (!matchingRoute) {
    next(new Error("权限不足"));
    return;
  }

  const resource = matchingRoute.path;
  const action = method; // 使用 HTTP 方法作为动作

  const rbacEnforcer = getRBACEnforcer();

  //   加载策略
  await rbacEnforcer.loadPolicy();

  let hasPermission = false;

  for (const role of roles) {
    console.log(`role::${role}`, `resource::${resource}`, `action::${action}`);

    hasPermission = await rbacEnforcer.enforce(
      `role::${role}`,
      `resource::${resource}`,
      `action::${action}`
    );

    if (hasPermission) {
      break;
    }
  }

  if (!hasPermission) {
    next(new Error("权限不足"));
    return;
  }

  next();
};

// 查找匹配的路由
function findMatchingRoute(router: any, url: string, method: string) {
  let matchingRoute = null;

  // 先找出所有路径匹配的路由
  const matchingRoutes = router.stack
    .filter((layer: ILayer) => {
      return (
        layer.route &&
        // @ts-ignore
        Object.keys(layer.route?.methods)[0] === method.toLowerCase()
      );
    })
    .map(({ route, regexp, keys }: ILayer) => {
      // @ts-ignore
      const { path } = route;
      return { path, regexp, keys };
    });

  // 优先匹配更具体的路由：排序方式可以根据路径的具体性来优化
  matchingRoutes.sort((a: any, b: any) => {
    // 首先按路径的动态部分的数量进行排序
    const dynamicCountA = _.isArray<string>(a.keys)
      ? a.keys?.filter((key: any) => key.name.includes(":")).length
      : 0;
    const dynamicCountB = _.isArray<string>(b.keys)
      ? b.keys?.filter((key: any) => key.name.includes(":")).length
      : 0;

    // 更高的动态参数数量意味着更具体
    if (
      dynamicCountA !== dynamicCountB &&
      dynamicCountA !== 0 &&
      dynamicCountB !== 0
    ) {
      return dynamicCountB - dynamicCountA;
    }

    // 如果动态参数数量相同，则按路径的长度排序
    // @ts-ignore
    return b.path.length - a.path.length;
  });

  // 进行匹配
  for (const route of matchingRoutes) {
    let match = false;

    match = route.regexp.exec(url);

    if (match) {
      matchingRoute = route; // 找到匹配的路由
      break;
    }
  }

  return matchingRoute;
}
