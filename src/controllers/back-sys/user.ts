import UserService from "../../services/userService";
import { getErrorMessage, getValidPageAndSize, resBodyBuilder } from "../../utils";
import { Request, Response, NextFunction } from "express";
import { InferAttributes } from "@sequelize/core";
import User from "../../models/user";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['user']
  try {
    const {
      username,
      password,
      confirmPassword,
      email,
      phone,
      avatar,
      menu,
    } = req.body as InferAttributes<User> & { confirmPassword: string };

    await UserService.createUser({
      username,
      password,
      email,
      phone,
      avatar,
      menu,
    });

    res.send(resBodyBuilder(null, "创建用户成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "创建用户失败";

    next(new Error(msg));
  }
};

export const getUsersByPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['user']
  try {
    const {
      username,
      email,
      phone,
      status,
      lastLoginTime,
      lastLoginIp,
      failedLoginAttempts,
      unlockTime,
      createdAtStart,
      createdAtEnd,
      updatedAtStart,
      updatedAtEnd,
    } = req.query;

    const { page, pageSize } = getValidPageAndSize(
      req.query.page,
      req.query.pageSize
    );

    const users = await UserService.getUsersByPage(page, pageSize, {
      username,
      email,
      phone,
      status,
      lastLoginTime,
      lastLoginIp,
      failedLoginAttempts,
      unlockTime,
      createdAtStart,
      createdAtEnd,
      updatedAtStart,
      updatedAtEnd,
    });

    res.send(resBodyBuilder(users, "获取用户列表成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取用户列表失败";

    next(new Error(msg));
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['user']
  try {
    const { id } = req.params;

    const user = await UserService.getUserById(+id);

    res.send(resBodyBuilder(user, "获取用户成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取用户失败";

    next(new Error(msg));
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['user']
  try {
    const { id } = req.params;
    const {
      password,
      email,
      phone,
      avatar,
      status,
    } = req.body as InferAttributes<User>;

    const counts = await UserService.updateUser(+id, {
      password,
      email,
      phone,
      avatar,
      status,
    });

    if (counts[0] === 0) {
      throw new Error("更新用户失败");
    }

    res.send(resBodyBuilder(null, "更新用户成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "更新用户失败";

    next(new Error(msg));
  }
};

export const deleteUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['user']
  try {
    const { ids } = req.params;

    const count = await UserService.deleteUsers(
      ids.split(",").map((id) => +id)
    );

    if (count === 0) {
      throw new Error("删除用户失败");
    }

    res.send(resBodyBuilder(count, "删除用户成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "删除用户失败";

    next(new Error(msg));
  }
};

export const getUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // #swagger.tags = ['user']
  try {
    const { id } = req.params;

    const roles = await UserService.getUserRoles(+id);

    res.send(resBodyBuilder(roles, "获取用户角色成功"));
  } catch (error) {
    let msg = getErrorMessage(error) || "获取用户角色失败";

    next(new Error(msg));
  }
};
