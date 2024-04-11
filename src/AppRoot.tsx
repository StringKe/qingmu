import { Outlet, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Suspense } from 'react';

export default function AppRoot() {
    const router = useRouter();

    console.log(router.options);
    return (
        <html>
            <head>
                <meta charSet='UTF-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1.0' />
                <title>Document</title>
                <link rel='icon' href='/favicon.ico' />
                <Suspense>{router.options.context.assets}</Suspense>
            </head>
            <body>
                <Outlet />
                <TanStackRouterDevtools position='bottom-right' />
            </body>
        </html>
    );
}
