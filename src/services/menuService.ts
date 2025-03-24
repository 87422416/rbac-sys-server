import User from "../models/user";
import { menu } from "../constant/menu";
import { rebuildTree } from "../utils";

export class MenuService {
  static getMenuTree() {
    return menu;
  }

  static async getMenuTreeByUsername(username: string) {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new Error("用户不存在");
    }

    return rebuildTree(menu, JSON.parse(user.menu));
  }
}
