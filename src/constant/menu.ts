
export type MenuItem = {
  key: string;
  title: string;
  value: string;
  children?: MenuItem[];
};

export const menu: MenuItem[] = [
  {
    key: "/user",
    title: "用户管理",
    value: "/user",
  },
  {
    key: "/role",
    title: "角色管理",
    value: "/role",
  },
  {
    key: "/permission",
    title: "权限管理",
    value: "/permission",
  },
  {
    key: "/menu",
    title: "菜单管理",
    value: "/menu",
  },
];
