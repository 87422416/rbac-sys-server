import { PermissionService } from "@/services/permissionService";
import { getErrorMessage, resBodyBuilder } from "@/utils";
import { Request, Response, NextFunction } from "express";

export const getPermissionsByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['permission']
  try {
    const { role } = req.params;

    const permissions = await PermissionService.getPermissionsByRole(role);

    res.send(resBodyBuilder(permissions, "获取角色权限列表成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取角色权限列表失败";
    next(new Error(msg));
  }
};

export const setPermissionsByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['permission']

  try {
    const { role } = req.params;
    const { permissions } = req.body;

    await PermissionService.setPermissionsByRole(role, permissions);

    res.send(resBodyBuilder(null, "设置角色权限成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "设置角色权限失败";
    next(new Error(msg));
  }
};

export const deletePermissionsByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['permission']

  try {
    const { role } = req.params;
    const { permissions } = req.body;

    await PermissionService.deletePermissionsByRole(role, permissions);

    res.send(resBodyBuilder(null, "删除角色权限成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "删除角色权限失败";
    next(new Error(msg));
  }
};

export const getPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['permission']
  try {
    let permissions = await PermissionService.getPermissions();

    res.send(resBodyBuilder(permissions, "获取所有权限成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取所有权限失败";
    next(new Error(msg));
  }
};
