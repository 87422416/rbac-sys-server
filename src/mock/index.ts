import User from "../models/user";
import { PermissionService } from "../services/permissionService";
import { RoleService } from "../services/roleService";
import UserService from "../services/userService";
import { InferAttributes } from "@sequelize/core";
import router from "../routes/router";
import { sequelize } from "../db";

export const mockRole = async (role: string) => {
  return RoleService.createRole(role);
};

export const mockUser = async (
  user: InferAttributes<User> & { roles?: string[] }
) => {
  UserService.createUser(user);
};

export const mockRoleAssign = async (userId: number, roles: string[]) => {
  await RoleService.assignRolesToUser(userId, roles);
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
  return RoleService.setRoleInheritance(role, parentRole);
};

export default async function mock() {
  // 清空casbin_rule
  await sequelize.query("DELETE FROM casbin_rule");

  // 初始化角色
  await mockRole("超级管理员");
  await mockRole("用户管理员");
  await mockRole("角色管理员");
  await mockRole("权限管理员");
  await mockRole("菜单管理员");

  // 初始化角色继承
  await mockRoleInheritance("用户管理员", "超级管理员");
  await mockRoleInheritance("角色管理员", "超级管理员");
  await mockRoleInheritance("权限管理员", "超级管理员");
  await mockRoleInheritance("菜单管理员", "超级管理员");

  // 初始化账号
  await mockUser({
    username: `kattle`,
    password: `kattle`,
    menu: ["/user", "/role", "/permission", "/menu"] as unknown as string,
    roles: ["超级管理员"],
  });

  // for (let i = 0; i < 10; i++) {
  //   await mockUser({
  //     username: `kattle${i}`,
  //     password: `kattle${i}`,
  //     menu: JSON.stringify(["/user", "/role", "/permission", "/menu"]),
  //     roles: ["超级管理员"],
  //   });
  // }

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

  await PermissionService.setPermissionsByRole("菜单管理员", [
    ["/menu", "get"],
    ["/menu/:userId", "get"],
  ]);

  // 分配角色给账号
  // await mockRoleAssign(1, ["超级管理员"]);
}
