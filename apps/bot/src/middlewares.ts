import { createMiddleware } from 'seyfert';

export const allMiddlewares = {
    checkIfRestarting: createMiddleware<void>(({ context, next, stop }) => {
        if (context.client.restarting) {
            return stop('Restarting, give me a few seconds');
        }
        next();
    }),
};
