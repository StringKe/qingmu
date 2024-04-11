/// <reference types="vinxi/types/client" />

import 'vinxi/client';

import { getManifest } from 'vinxi/manifest';

import { StartClient } from '@tanstack/react-router-server/client';
import { hydrateRoot, Root } from 'react-dom/client';

import { createRouter } from '~/lib/utils/react-router';

import AppRoot from './AppRoot';

render();

function render(mod?: any) {
    const clientManifest = getManifest('client');

    const router = createRouter(AppRoot, clientManifest, undefined);

    const app = <StartClient router={router} />;

    if (!mod) {
        window.$root = hydrateRoot(document, app);
    } else {
        window.$root?.render(app);
    }
}

if (import.meta.hot) {
    import.meta.hot.accept((mod) => {
        if (mod) {
            render(mod);
        }
    });
}

declare global {
    interface Window {
        $root?: Root;
    }
}
