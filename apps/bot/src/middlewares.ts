import { createMiddleware } from 'seyfert';

export const allMiddlewares = {
    checkIfRestarting: createMiddleware<undefined>(({ context, next, stop }) => {
        if (context.client.restarting) {
            stop(`Restarting, give me a few seconds`); return;
        }
        next();
    })
};
