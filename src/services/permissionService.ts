import { getRBACEnforcer } from "../rbac";
import Role from "../models/role";
import router from "../routes";

export class PermissionService {
  // 删除权限
  static async deletePermissionsByRole(role: string, permissions: string[][]) {
    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();

    // 遍历删除权限
    for (const permission of permissions) {
      const obj = `resource::${permission[0]}`;
      const act = `action::${permission[1]}`;
      const res = await rbacEnforcer.deletePermissionForUser(
        `role::${role}`,
        obj,
        act
      );

      if (!res) {
        throw new Error("删除权限失败");
      }
    }

    // 保存策略
    await rbacEnforcer.savePolicy();
  }

  // 查看角色的权限
  static async getPermissionsByRole(role: string) {
    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();
    // 获取角色权限
    const permissions = await rbacEnforcer.getPermissionsForUser(
      `role::${role.toString()}`
    );
    return permissions?.map((p) => {
      p[1] = p[1].replace("resource::", "");
      p[2] = p[2].replace("action::", "");
      return `${p[1]}::${p[2]}`;
    });
  }

  // 设置角色的权限
  static async setPermissionsByRole(role: string, permissions: string[][]) {
    const roleInstance = await Role.findOne<Role>({ where: { label: role } });
    if (!roleInstance) {
      throw new Error("角色不存在");
    }

    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();

    // 设置用户权限
    const res = await Promise.all(
      permissions.map((permission) => {
        permission[0] = `resource::${permission[0]}`;
        permission[1] = `action::${permission[1]}`;
        return rbacEnforcer.addPermissionForUser(
          `role::${role}`,
          ...permission
        );
      })
    );
    // 判断是否设置成功
    if (!res.every((r) => r)) {
      throw new Error("设置权限失败");
    }
    // 保存策略
    await rbacEnforcer.savePolicy();
  }

  // 查看所有权限
  static getPermissions() {
    const routes = router.stack
      .filter((middleware) => middleware.route) // 过滤出实际的路由
      .map((middleware) => {
        const route = middleware.route;
        return {
          path: route?.path as string,
          // @ts-ignore
          action: Object.keys(route?.methods)[0] as PermissionAction,
        };
      });

    return routes;
  }
}
