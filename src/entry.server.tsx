/// <reference types="vinxi/types/server" />

import { eventHandler, setHeader, toWebRequest } from 'vinxi/http';
import { getManifest } from 'vinxi/manifest';

import { createMemoryHistory } from '@tanstack/react-router';
import { StartServer } from '@tanstack/react-router-server/server';
import { renderAsset } from '@vinxi/react';
import { Suspense } from 'react';
import { PipeableStream, renderToPipeableStream } from 'react-dom/server';

import AppRoot from '~/AppRoot';
import { processApiRouter } from '~/lib/utils/api-router.server';
import { createRouter } from '~/lib/utils/react-router';

export default eventHandler(async (event) => {
    const req = toWebRequest(event);
    const url = new URL(req.url, 'http://localhost');
    const href = url.href.replace(url.origin, '');

    const matchApiRouter = processApiRouter(href);
    if (matchApiRouter) {
        return await matchApiRouter.route.handler(event, matchApiRouter.result.params || {});
    }

    const clientManifest = getManifest('client');
    const serverManifest = getManifest('ssr');

    const assets = await clientManifest.inputs[clientManifest.handler].assets();

    const history = createMemoryHistory({
        initialEntries: [href],
    });

    const router = createRouter(AppRoot, clientManifest, serverManifest);

    router.update({
        history,
        context: {
            ...router.options.context,
            assets: <Suspense>{assets.map((m) => renderAsset(m as never))}</Suspense>,
        },
    });

    await router.load();

    const stream = await new Promise<PipeableStream>(async (resolve) => {
        const stream = renderToPipeableStream(<StartServer router={router} />, {
            onShellReady() {
                resolve(stream);
            },
            bootstrapModules: [clientManifest.inputs[clientManifest.handler].output.path],
            bootstrapScriptContent: `window.manifest = ${JSON.stringify(await clientManifest.json())}; window.base = ${JSON.stringify('/')};`,
        });
    });

    setHeader(event, 'Content-Type', 'text/html');

    return stream;
});
