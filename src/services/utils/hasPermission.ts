export default function hasPermission(permission: string, roles: [string]) {
    if (roles.includes('admin')) return true;
    return roles.includes(permission);
}
