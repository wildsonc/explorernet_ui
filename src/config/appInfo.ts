export const websiteDomain =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:123';

export const apiDomain =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:321';

export const appInfo = {
    appName: 'explorernet',
    apiDomain,
    websiteDomain,
    apiBasePath: '/api/auth',
    websiteBasePath: '/auth',
};
