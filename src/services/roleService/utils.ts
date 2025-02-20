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
  children: RoleTreeNode[];
}

export async function buildRoleInheritanceTreeById(
  roleManager: RoleManager,
  roleId: string
): Promise<RoleTreeNode> {
  const node: RoleTreeNode = {
    title: roleId,
    value: roleId,
    children: [],
  };

  // 获取该角色直接继承的所有角色
  const childRoles = await roleManager.getRoles(`role::${roleId}`);

  // 递归构建子树
  for (const childRole of childRoles) {
    // 从 "role::123" 格式中提取ID
    const childId = childRole.split("::")[1];
    if (childId !== roleId) {
      // 避免自引用
      const childNode = await buildRoleInheritanceTreeById(
        roleManager,
        childId
      );
      node.children.push(childNode);
    }
  }

  return node;
}
