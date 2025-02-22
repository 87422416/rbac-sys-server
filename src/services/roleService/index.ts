import Role from "../../models/role";
import { getRBACEnforcer } from "../../rbac";
import UserService from "../userService";
import { buildRoleInheritanceTreeById } from "./utils";
import { Op } from "@sequelize/core";
import { generateWhereOptions } from "../../utils";

export class RoleService {
  // 创建角色
  static async createRole(label: string) {
    return Role.create({ label });
  }
  // 删除角色
  static async deleteRole(role: string) {
    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();

    const rolesInstance = await Role.findOne({
      where: { label: role },
    });

    // 判断是否存在
    if (!rolesInstance) {
      throw new Error(`${role} 角色不存在`);
    }

    // // 删除该角色作为父角色的所有继承关系（g策略第一列为role::${role}）
    await rbacEnforcer.removeFilteredGroupingPolicy(0, `role::${role}`);
    // // 删除该角色作为子角色的所有继承关系（g策略第二列为role::${role}）
    await rbacEnforcer.removeFilteredGroupingPolicy(1, `role::${role}`);

    // 删除该角色相关的所有访问策略（p 表中删除所有与该角色相关的策略）
    await rbacEnforcer.removeFilteredPolicy(0, `role::${role}`); // 0 表示第一列是角色，删除所有与该角色相关的策略

    // 删除角色的记录
    const res = await Role.destroy({ where: { label: role } });

    if (res === 0) {
      throw new Error(`删除角色失败`);
    }

    // 保存策略
    await rbacEnforcer.savePolicy();

    return res;
  }

  // 查看所有角色
  static async getRoles() {
    return Role.findAll();
  }

  // 分配角色给用户
  static async assignRoleToUser(userId: number, role: string) {
    const user = await UserService.getUserById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }
    const roleInstance = await Role.findOne<Role>({ where: { label: role } });
    if (!roleInstance) {
      throw new Error("角色不存在");
    }

    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();
    // 添加角色
    const addRes = await rbacEnforcer.addRoleForUser(
      `user::${userId.toString()}`,
      `role::${role.toString()}`
    );
    if (!addRes) {
      throw new Error("分配角色失败");
    }
    // 保存策略
    await rbacEnforcer.savePolicy();
  }
  // 撤销用户的角色
  static async revokeRoleFromUser(userId: number, role: string) {
    const roleInstance = await Role.findOne<Role>({ where: { label: role } });
    if (!roleInstance) {
      throw new Error("角色不存在");
    }

    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();
    // 删除角色
    const res = await rbacEnforcer.deleteRoleForUser(
      `user::${userId.toString()}`,
      `role::${role.toString()}`
    );
    if (!res) {
      throw new Error("撤销角色失败");
    }
    // 保存策略
    await rbacEnforcer.savePolicy();
  }
  // 查看角色的用户列表
  static async getUsersIdByRole(role: string) {
    const roleInstance = await Role.findOne<Role>({ where: { label: role } });
    if (!roleInstance) {
      throw new Error("角色不存在");
    }

    const rbacEnforcer = getRBACEnforcer();
    // 重新加载策略
    await rbacEnforcer.loadPolicy();
    // 获取角色用户
    const users = await rbacEnforcer.getUsersForRole(
      `role::${role.toString()}`
    );
    return users.map((user) => user.split("::")[1]);
  }

  // 角色继承
  static async setRoleInheritance(role: string, parentRole: string) {
    const enforcer = await getRBACEnforcer();

    // 加载策略
    await enforcer.loadPolicy();

    // 设置角色继承
    const res = await enforcer.addGroupingPolicy(
      `role::${parentRole.toString()}`,
      `role::${role.toString()}`
    );

    if (!res) {
      throw new Error("角色继承失败");
    }
    // 保存策略
    await enforcer.savePolicy();
  }

  // 获取角色的继承链
  static async getRolesInheritanceTree(role: string = "") {
    const enforcer = await getRBACEnforcer();
    // 重新加载策略
    await enforcer.loadPolicy();
    const whereOptions = generateWhereOptions<Role>({ label: role }, (obj) => ({
      label: obj.label ? { [Op.like]: `%${obj.label}%` } : undefined,
    }));

    const data = await Role.findAll({
      where: whereOptions,
    });

    const roles = data.map((role) => role.label);

    const roleInheritanceTree = await Promise.all(
      roles.map((role) =>
        buildRoleInheritanceTreeById(enforcer.getRoleManager(), role)
      )
    );
    return roleInheritanceTree;
  }
}
