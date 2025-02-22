import { MenuService } from "@/services/menuService";
import UserService from "@/services/userService";
import { getErrorMessage, resBodyBuilder } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const getMenuTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['menu']
  try {
    const menuTree = MenuService.getMenuTree();
    res.send(resBodyBuilder(menuTree, "获取菜单树成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取菜单树失败";
    next(new Error(msg));
  }
};

export const getMenuTreeByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // #swagger.tags = ['menu']
    const { userId } = req.params;

    const menuTree = await MenuService.getMenuTreeByUserId(userId);

    res.send(resBodyBuilder(menuTree, "获取菜单树成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取菜单树失败";
    next(new Error(msg));
  }
};
