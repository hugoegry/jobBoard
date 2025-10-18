// services/permissionService.js
const permissionsMatrix = {
  admin: {
    user: ['create', 'update', 'delete', 'view'],
    document: ['create', 'update', 'delete', 'view']
  },
  editor: {
    user: ['view', 'update'],
    document: ['create', 'update', 'view']
  },
  viewer: {
    user: ['view'],
    document: ['view']
  }
};

export function hasPermission(role, resource, action) {
  const perms = permissionsMatrix[role];
  if (!perms) return false;
  return perms[resource]?.includes(action) || false;
}
