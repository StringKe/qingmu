import reactRefresh from '@vitejs/plugin-react';
import { createApp } from 'vinxi';
import tsconfigPaths from 'vite-tsconfig-paths';

import { baseRouter } from './src-dev/router';

export default createApp({
    routers: [
        {
            name: 'public',
            type: 'static',
            dir: './public',
        },
        {
            name: 'client',
            type: 'client',
            handler: './src/entry.client.tsx',
            target: 'browser',
            routes: baseRouter({ dir: './src/app' }),
            plugins: () => [tsconfigPaths(), reactRefresh()],
        },
        {
            name: 'ssr',
            type: 'http',
            handler: './src/entry.server.tsx',
            target: 'server',
            routes: baseRouter({ dir: './src/app' }),
            plugins: () => [tsconfigPaths(), reactRefresh()],
        },
    ],
});
