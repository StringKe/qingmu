import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en-US', 'zh-CN'],
    defaultLocale: 'en-US',
    localePrefix: 'always',
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(en-US|zh-CN)/:path*'],
};
