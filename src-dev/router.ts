import { posix } from 'node:path';

import { resolve, RouterStyleFn } from 'vinxi';
import { analyzeModule, BaseFileSystemRouter, cleanPath } from 'vinxi/fs-router';

import fg from 'fast-glob';

export declare type RouterPluginConfig = {
    dir: string;
    extensions?: string[];
};

// 定一个 Server 和 Client 共用的路由
class QingmuBaseRouter extends BaseFileSystemRouter {
    toPath(src: string): string {
        const routePath = cleanPath(src, this.config)
            .replace('index.', '.')
            .replace('_index', 'index')
            .replace('.layout', '/')
            .replace('.page', '')
            .replace('.api', '');

        return routePath?.length > 0 ? `${routePath}` : '/';
    }

    glob() {
        return (
            posix.join(fg.convertPathToPattern(this.config.dir), '**/*') +
            `.(page|layout|api).{${this.config.extensions.join(',')}}`
        );
    }

    toComponentRouter(src: string) {
        let path = this.toPath(src);

        const [_, exports] = analyzeModule(src);
        const hasLoader = exports.find((e) => e.n === 'loader');
        const hasErrorBoundary = exports.find((e) => e.n === 'ErrorBoundary');
        const hasLoading = exports.find((e) => e.n === 'Loading');
        const hasConfig = exports.find((e) => e.n === 'config');
        const hasI18n = exports.find((e) => e.n === 'i18n');

        return {
            type: 'react',
            $component: {
                src: src,
                pick: ['default', '$css'],
            },
            $error: hasErrorBoundary ? { src: src, pick: ['ErrorBoundary'] } : undefined,
            $loading: hasLoading ? { src: src, pick: ['Loading'] } : undefined,
            $$loader: hasLoader
                ? {
                      src: src,
                      pick: ['loader'],
                  }
                : undefined,
            $$config: hasConfig ? { src: src, pick: ['config'] } : undefined,
            $$i18n: hasI18n ? { src: src, pick: ['i18n'] } : undefined,
            path,
            filePath: src,
        };
    }

    toApiRouter(src: string) {
        let path = this.toPath(src);

        const [_, exports] = analyzeModule(src);
        const hasGET = exports.find((e) => e.n === 'GET');
        const hasPOST = exports.find((e) => e.n === 'POST');
        const hasPUT = exports.find((e) => e.n === 'PUT');
        const hasDELETE = exports.find((e) => e.n === 'DELETE');
        const hasPATCH = exports.find((e) => e.n === 'PATCH');
        const hasHEAD = exports.find((e) => e.n === 'HEAD');
        const hasOPTIONS = exports.find((e) => e.n === 'OPTIONS');

        return {
            type: 'api',
            $DEFAULT: {
                src: src,
                pick: ['default'],
            },
            $GET: hasGET ? { src: src, pick: ['GET'] } : undefined,
            $POST: hasPOST ? { src: src, pick: ['POST'] } : undefined,
            $PUT: hasPUT ? { src: src, pick: ['PUT'] } : undefined,
            $DELETE: hasDELETE ? { src: src, pick: ['DELETE'] } : undefined,
            $PATCH: hasPATCH ? { src: src, pick: ['PATCH'] } : undefined,
            $HEAD: hasHEAD ? { src: src, pick: ['HEAD'] } : undefined,
            $OPTIONS: hasOPTIONS ? { src: src, pick: ['OPTIONS'] } : undefined,
            path,
            filePath: src,
        };
    }

    toRoute(src: string) {
        const isApi = src.endsWith('.api.ts');
        return isApi ? this.toApiRouter(src) : this.toComponentRouter(src);
    }
}

export function baseRouter(config: RouterPluginConfig): RouterStyleFn {
    return (router, app) => {
        const dir = resolve.absolute(config.dir, router.root || '');
        const extensions = config.extensions ?? ['ts', 'tsx', 'jsx', 'js'];

        return new QingmuBaseRouter(
            {
                dir: dir,
                extensions: extensions,
            },
            router,
            app,
        );
    };
}
