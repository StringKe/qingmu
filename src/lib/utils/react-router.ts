import fileRouters, { RouteModule } from 'vinxi/routes';

import { createRootRouteWithContext, Route, Router } from '@tanstack/react-router';
import { lazyRoute } from '@vinxi/react';

import { getRouterType } from '~/lib/utils/router';
import { AppRouterContext, ComponentRouterHandle, VinxiManifest } from '~/lib/utils/types';

const defineComponentRouters = fileRouters
    .filter((o) => getRouterType(o) === 'react')
    .sort((a, b) => a.path.length - b.path.length)
    .sort((a, b) => {
        if (a.path.includes('.layout.tsx')) {
            return -1;
        }

        if (b.path.includes('.layout.tsx')) {
            return 1;
        }

        return 0;
    });

function createNestedRoute(fileRoutes: RouteModule[]) {
    function processRoute(routes: ComponentRouterHandle[], route: ComponentRouterHandle, id: string, full: string) {
        const parentRoute = Object.values(routes).find((o) => {
            const oPath = (o.path + '/').replace('//', '/');
            return id.startsWith(oPath);
        });

        if (!parentRoute) {
            routes.push({ ...route, path: id });
            return routes;
        }

        processRoute(
            parentRoute.children || (parentRoute.children = []),
            route,
            id.slice(parentRoute.path.length),
            full,
        );

        return routes;
    }

    return (fileRoutes.sort((a, b) => a.path.length - b.path.length) as ComponentRouterHandle[]).reduce(
        (prevRoutes, route) => {
            return processRoute(prevRoutes, route, route.path, route.path);
        },
        [] as ComponentRouterHandle[],
    );
}

export function createRouter(Root: () => any, clientManifest: VinxiManifest, serverManifest?: VinxiManifest) {
    const routes = createNestedRoute(defineComponentRouters);

    const rootRoute = createRootRouteWithContext<AppRouterContext>()({
        component: Root,
        meta: () => [
            {
                title: 'Root',
            },
        ],
        links: () => [
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/favicons/apple-touch-icon.png',
            },
        ],
        scripts: () => [
            {
                src: 'https://cdn.tailwindcss.com',
            },
        ],
    });

    function createRoute(route: ComponentRouterHandle, parent: Route) {
        const parentRoute = new Route({
            path: route.path,
            component: lazyRoute(route.$component, clientManifest, serverManifest),
            errorComponent: route.$error
                ? lazyRoute(route.$error, clientManifest, serverManifest, 'ErrorBoundary')
                : undefined,
            pendingComponent: route.$loading
                ? lazyRoute(route.$loading, clientManifest, serverManifest, 'Loading')
                : undefined,
            loader: route.$$loader?.require().loader,
            ...(route.$$config?.require().config ?? {}),
            getParentRoute: () => parent,
        });

        if (route.children) {
            parent.addChildren(route.children.map((o) => createRoute(o, parentRoute)));
        }

        return parentRoute;
    }

    const routeTree = rootRoute.addChildren([
        ...routes.map((route) => {
            return createRoute(route, rootRoute as never);
        }),
    ]);

    return new Router({
        routeTree,
        defaultPreload: 'intent',
        context: {
            assets: null as any,
        },
    });
}
