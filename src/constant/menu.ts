export type MenuItem = {
  name: string;
  title: string;
  value: string;
  routes?: MenuItem[];
};

export const menu: MenuItem[] = [
  {
    name: "user",
    title: "用户管理",
    value: "/user",
  },
  {
    name: "role",
    title: "角色管理",
    value: "/role",
  },
  {
    name: "permission",
    title: "权限管理",
    value: "/permission",
  },
];
