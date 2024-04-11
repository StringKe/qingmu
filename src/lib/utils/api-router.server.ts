import fileRouters from 'vinxi/routes';
import { EventHandlerRequest, H3Event } from 'vinxi/server';

import { get } from 'lodash-es';

import { getRouterType, matchRouter } from '~/lib/utils/router';
import { ApiRouterHandle, ApiRouterMatchResult, RouterHandle } from '~/lib/utils/types';

const defineApiRouters = fileRouters
    .filter((o) => getRouterType(o) === 'api')
    .sort((a, b) => a.path.length - b.path.length)
    .reverse();

export const apiRouters = defineApiRouters.map((route) => {
    const handler: ApiRouterHandle['handler'] = async (
        event: H3Event<EventHandlerRequest>,
        params: Record<string, any>,
    ) => {
        event.context['params'] = params;

        let handle: RouterHandle | undefined = route['$DEFAULT'];

        const method = `$${event.method}`.toUpperCase();
        if (!handle && handle[method]) {
            handle = get(route, method);
        }

        if (!handle) {
            return {
                status: 404,
                body: 'Not Found',
            };
        }

        const routerFn = (await handle.import()) as {
            default: (event: H3Event<EventHandlerRequest>) => Promise<any>;
        };

        return await routerFn.default(event);
    };

    return {
        ...route,
        path: route.path,
        handler: handler,
    } as never as ApiRouterHandle;
});

export function processApiRouter(path: string) {
    const matchedApiRouter = apiRouters.reduce((acc, router) => {
        if (acc) {
            return acc;
        }

        const matchResult = matchRouter(router.path, path);
        if (matchResult.isMatch) {
            return {
                result: matchResult,
                route: router,
            };
        }

        return acc;
    }, undefined as ApiRouterMatchResult);

    if (matchedApiRouter && matchedApiRouter.result.isMatch) {
        return matchedApiRouter;
    }
    return undefined;
}
