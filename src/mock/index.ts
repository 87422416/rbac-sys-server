import User from "@/models/user";
import { PermissionService } from "@/services/permissionService";
import { RoleService } from "@/services/roleService/roleService";
import UserService from "@/services/userService";
import { InferAttributes } from "@sequelize/core";
import router from "@/routes/router";
import { sequelize } from "@/db";
export const mockRole = async (role: string) => {
  await RoleService.createRole(role);
};

export const mockUser = async (user: InferAttributes<User>) => {
  UserService.createUser(user);
};

export const mockRoleAssign = async (userId: number, role: string) => {
  await RoleService.assignRoleToUser(userId, role);
};

export const mockRolePermission = async (role: string) => {
  const routes = router.stack
    .filter((middleware) => middleware.route) // 过滤出实际的路由
    .map((middleware) => {
      const route = middleware.route;
      return [
        `${route?.path as string}`,
        // @ts-ignore
        `${Object.keys(route?.methods)[0] as PermissionAction}`,
      ];
    });

  await PermissionService.setPermissionsByRole(role, routes);
};

export const mockRoleInheritance = async (role: string, parentRole: string) => {
  await RoleService.setRoleInheritance(role, parentRole);
};

export default async function mock() {
  // 初始化账号
  await mockUser({ username: "kattle", password: "kattle" });

  // 清空casbin_rule
  await sequelize.query("DELETE FROM casbin_rule");

  // 初始化角色
  await mockRole("超级管理员");
  await mockRole("用户管理员");
  await mockRole("角色管理员");
  await mockRole("权限管理员");

  // 初始化角色继承
  await mockRoleInheritance("用户管理员", "超级管理员");
  await mockRoleInheritance("角色管理员", "超级管理员");
  await mockRoleInheritance("权限管理员", "超级管理员");

  // 初始化角色权限
  await PermissionService.setPermissionsByRole("角色管理员", [
    ["/roles/inheritance", "get"],
    ["/role", "post"],
    ["/role/inheritance", "post"],
    ["/role/revoke", "put"],
    ["/role/:role", "delete"],
    ["/roles", "get"],
    ["/role/assign", "post"],
    ["/role/users/:role", "get"],
  ]);

  await PermissionService.setPermissionsByRole("用户管理员", [
    ["/user", "post"],
    ["/users", "get"],
    ["/user/:id", "get"],
    ["/user/:id", "put"],
    ["/users/:ids", "delete"],
    ["/user/role/:id", "get"],
  ]);

  await PermissionService.setPermissionsByRole("权限管理员", [
    ["/permissions", "get"],
    ["/permissions/:role", "post"],
    ["/permissions/:role", "get"],
    ["/permissions/:role", "delete"],
  ]);

  // 分配角色给账号
  await mockRoleAssign(1, "超级管理员");
}
