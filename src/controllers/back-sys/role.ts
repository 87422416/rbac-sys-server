import Role from "@/models/role";
import { RoleService } from "@/services/roleService/roleService";
import { resBodyBuilder } from "@/utils";
import { getErrorMessage } from "@/utils";
import { InferAttributes } from "@sequelize/core";
import { Request, Response, NextFunction } from "express";

export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const { label } = req.body as InferAttributes<Role>;
    await RoleService.createRole(label);
    res.send(resBodyBuilder(null, "创建角色成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "创建角色失败";

    next(new Error(msg));
  }
};

export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const { role } = req.params;

    const counts = await RoleService.deleteRole(role);

    if (counts === 0) {
      throw new Error("删除角色失败");
    }
    res.send(resBodyBuilder(null, "删除角色成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "删除角色失败";

    next(new Error(msg));
  }
};

export const getRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const roles = await RoleService.getRoles();
    res.send(resBodyBuilder(roles, "获取角色列表成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取角色列表失败";
    next(new Error(msg));
  }
};

export const revokeRoleFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const { userId, role } = req.body;

    await RoleService.revokeRoleFromUser(userId, role);

    res.send(resBodyBuilder(null, "撤销角色成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "撤销角色失败";
    next(new Error(msg));
  }
};

export const getUsersIdByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const { role } = req.params;

    const users = await RoleService.getUsersIdByRole(role);

    res.send(resBodyBuilder(users, "获取角色用户列表成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取角色用户列表失败";
    next(new Error(msg));
  }
};

export const assignRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const { userId, role } = req.body;

    await RoleService.assignRoleToUser(userId, role);

    res.send(resBodyBuilder(null, "分配角色成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "创建角色失败";
    next(new Error(msg));
  }
};

export const setRoleInheritance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const { role, parentRole } = req.body;

    const roleInstance = await Role.findOne<Role>({ where: { label: role } });
    if (!roleInstance) {
      throw new Error("角色不存在");
    }

    const parentRoleInstance = await Role.findOne<Role>({
      where: { label: parentRole },
    });
    if (!parentRoleInstance) {
      throw new Error("父角色不存在");
    }

    await RoleService.setRoleInheritance(role, parentRole);

    res.send(resBodyBuilder(null, "设置角色继承成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "设置角色继承失败";
    next(new Error(msg));
  }
};

export const getRolesInheritanceTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['role']
  try {
    const { role } = req.query;

    const forest = await RoleService.getRolesInheritanceTree(role as string);
    res.send(resBodyBuilder(forest, "获取角色继承列表成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取角色继承列表失败";
    next(new Error(msg));
  }
};
