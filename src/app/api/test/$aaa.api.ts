import { eventHandler } from 'vinxi/http';

export default eventHandler(async (event) => {
    return {
        params: event.context.params,
        path: event.path,
    };
});
