import { getManifest } from 'vinxi/manifest';
import { RouteModule } from 'vinxi/routes';
import { EventHandlerRequest, H3Event } from 'vinxi/server';

export interface MatchResult {
    isMatch: boolean;
    params?: { [key: string]: string };
}

export declare type VinxiManifest = ReturnType<typeof getManifest>;
export declare type RouterHandle = RouteModule['$handle'];

export declare type ApiRouterHandle = RouteModule & {
    handler: (event: H3Event<EventHandlerRequest>, params: Record<string, any>) => Promise<any>;
};

export declare type ApiRouterMatchResult = { result: MatchResult; route: ApiRouterHandle } | undefined;

export declare type AppRouterContext = {
    assets?: any;
};

export declare type ComponentRouterHandle = RouteModule & {
    children?: ComponentRouterHandle[];
};
