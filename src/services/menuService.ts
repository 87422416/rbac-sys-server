import { menu } from "../constant/menu";
import UserService from "./userService";

export class MenuService {
  static getMenuTree() {
    return menu;
  }

  static async getMenuTreeByUserId(userId: string) {
    const user = await UserService.getUserById(+userId);

    if (!user) {
      throw new Error("用户不存在");
    }

    return user.menu;
  }
}
