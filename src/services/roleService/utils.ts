interface RoleManager {
  // Clear clears all stored data and resets the role manager to the initial state.
  clear(): Promise<void>;
  // AddLink adds the inheritance link between two roles. role: name1 and role: name2.
  // domain is a prefix to the roles (can be used for other purposes).
  addLink(name1: string, name2: string, ...domain: string[]): Promise<void>;
  // DeleteLink deletes the inheritance link between two roles. role: name1 and role: name2.
  // domain is a prefix to the roles (can be used for other purposes).
  deleteLink(name1: string, name2: string, ...domain: string[]): Promise<void>;
  // HasLink determines whether a link exists between two roles. role: name1 inherits role: name2.
  // domain is a prefix to the roles (can be used for other purposes).
  hasLink(name1: string, name2: string, ...domain: string[]): Promise<boolean>;
  // syncedHasLink is same as hasLink, but not wrapped in promise. Should not be called
  // if the matchers contain an asynchronous method. Can increase performance.
  syncedHasLink?(name1: string, name2: string, ...domain: string[]): boolean;
  // GetRoles gets the roles that a user inherits.
  // domain is a prefix to the roles (can be used for other purposes).
  getRoles(name: string, ...domain: string[]): Promise<string[]>;
  // GetUsers gets the users that inherits a role.
  // domain is a prefix to the users (can be used for other purposes).
  getUsers(name: string, ...domain: string[]): Promise<string[]>;
  // PrintRoles prints all the roles to log.
  printRoles(): Promise<void>;
}

export interface RoleTreeNode {
  title: string;
  value: string;
  children?: RoleTreeNode[];
}

export async function buildRoleInheritanceTreeById(
  roleManager: RoleManager,
  role: string,
  value: string
): Promise<RoleTreeNode> {
  const node: RoleTreeNode = {
    title: role,
    value: value,
  };

  // 获取该角色直接继承的所有角色
  const childRoles = await roleManager.getRoles(`role::${role}`);

  // 使用 map 和 Promise.all 替代 forEach，确保所有子节点都构建完成
  const childNodesPromises = childRoles.map(async (childRole) => {
    // 从 "role::123" 格式中提取ID
    const childLable = childRole.split("::")[1];
    if (childLable !== role) {
      // 避免自引用
      return await buildRoleInheritanceTreeById(
        roleManager,
        childLable,
        `${role}-${childLable}`
      );
    }
    return null;
  });

  // 等待所有子节点构建完成
  const childNodes = await Promise.all(childNodesPromises);

  // 过滤掉空值，并添加到 children 数组
  node.children = childNodes.filter((childNode) => childNode !== null);

  return node;
}
