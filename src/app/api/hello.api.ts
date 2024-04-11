import { eventHandler } from 'vinxi/http';

export default eventHandler(async (event) => {
    return {
        body: 'Hello, World!',
    };
});

export const POST = eventHandler(async (event) => {
    return {
        body: 'Hello, World!',
    };
});
