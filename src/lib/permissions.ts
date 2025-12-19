export type UserRole = 'ADMIN' | 'WAITER' | 'KITCHEN' | 'CASHIER'

export const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['/pos', '/kitchen', '/admin'],
  WAITER: ['/pos'],
  KITCHEN: ['/kitchen'],
  CASHIER: ['/pos'],
}

export function canAccessPath(role: UserRole | undefined, path: string): boolean {
  if (!role) return false
  const allowedPaths = rolePermissions[role] || []
  return allowedPaths.some(p => path.startsWith(p))
}

// API permissions by role
export const apiPermissions: Record<string, UserRole[]> = {
  // Admin-only APIs
  '/api/users': ['ADMIN'],
  '/api/ingredients': ['ADMIN'],
  '/api/stock': ['ADMIN'],
  '/api/products': ['ADMIN'],
  '/api/categories': ['ADMIN'],
  '/api/tables': ['ADMIN'],
  '/api/reports': ['ADMIN'],
  '/api/dashboard': ['ADMIN'],
  
  // Order APIs - multiple roles can access
  '/api/orders': ['ADMIN', 'WAITER', 'CASHIER', 'KITCHEN'],
  '/api/payments': ['ADMIN', 'WAITER', 'CASHIER'],
  
  // Auth APIs - all authenticated users
  '/api/auth/me': ['ADMIN', 'WAITER', 'CASHIER', 'KITCHEN'],
}

export function canAccessApi(role: UserRole | undefined, apiPath: string, method: string): boolean {
  if (!role) return false
  
  // Find matching API permission
  for (const [path, allowedRoles] of Object.entries(apiPermissions)) {
    if (apiPath.startsWith(path)) {
      // For read operations, be more permissive
      if (method === 'GET' && (path.includes('products') || path.includes('categories') || path.includes('tables'))) {
        return ['ADMIN', 'WAITER', 'CASHIER'].includes(role)
      }
      return allowedRoles.includes(role)
    }
  }
  
  // Default deny
  return false
}
