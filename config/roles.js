// Role hierarchy and permissions configuration
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
};

// Role hierarchy - higher index = higher authority
export const ROLE_HIERARCHY = [
  ROLES.STAFF,           // Level 0 - Lowest
  ROLES.MANAGER,         // Level 1
  ROLES.ADMIN,           // Level 2
  ROLES.SUPER_ADMIN      // Level 3 - Highest
];

// Get role level in hierarchy
export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY.indexOf(role);
};

// Check if user can assign tasks to target role
export const canAssignTaskTo = (assignerRole, targetRole) => {
  const assignerLevel = getRoleLevel(assignerRole);
  const targetLevel = getRoleLevel(targetRole);

  // Can assign to same level or lower
  return assignerLevel >= targetLevel;
};

// Check if user can manage (approve/reject) another user
export const canManageUser = (managerRole, targetRole) => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);

  // Super admin can manage everyone
  if (managerRole === ROLES.SUPER_ADMIN) return true;

  // Admin can manage users below them (managers and staff, but not other admins or super admins)
  if (managerRole === ROLES.ADMIN && managerLevel > targetLevel) return true;

  return false;
};

// Role permissions mapping
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    users: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
    tasks: ['create', 'read', 'update', 'delete', 'assign'],
    trailers: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    transactions: ['create', 'read', 'update', 'delete'],
    reports: ['read', 'export'],
    staff: ['create', 'read', 'update', 'delete'],
    all: true // Super admin has all permissions
  },
  [ROLES.ADMIN]: {
    users: ['read', 'approve'], // Can view and approve users (except super admins)
    tasks: ['create', 'read', 'update', 'delete', 'assign'],
    trailers: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    transactions: ['create', 'read', 'update', 'delete'],
    reports: ['read', 'export'],
    staff: ['create', 'read', 'update', 'delete']
  },
  [ROLES.MANAGER]: {
    tasks: ['create', 'read', 'update', 'assign'], // Can assign tasks to staff
    trailers: ['create', 'read', 'update'],
    customers: ['create', 'read', 'update'],
    transactions: ['create', 'read', 'update'],
    reports: ['read'],
    staff: ['read', 'update']
  },
  [ROLES.STAFF]: {
    tasks: ['read', 'update'], // Can view and update their own tasks
    trailers: ['read'],
    customers: ['read']
  }
};

// Check if role has permission for resource and action
export const hasPermission = (role, resource, action) => {
  const rolePermissions = PERMISSIONS[role];

  if (!rolePermissions) return false;

  // Super admin has all permissions
  if (rolePermissions.all) return true;

  // Check specific resource permissions
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
};

export default {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  getRoleLevel,
  canAssignTaskTo,
  canManageUser,
  hasPermission
};
