import { serve } from '@hono/node-server';
import { config } from '@repo/config';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Logger } from 'seyfert';
import { drawTicTacToe } from './drawTicTacToe.js';

const app = new Hono();
const logger = new Logger({
    name: '[Z_API]',
});

app.use((c, next) => {
    const auth = c.req.header('Authorization');
    if (auth === config.auth.api) {
        return next();
    }
    throw new HTTPException(418, {
        message: 'Invalid authorization header',
    });
});

app.get('/stats', (c) =>
    c.json({
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
    }),
);

app.get('/tictactoe/display', async (c) => {
    const table = (c.req.query('table') ?? '').split(',').map(Number);
    const result = (await drawTicTacToe(table)) as unknown as ArrayBuffer;
    return c.body(result);
});

serve(
    {
        fetch: app.fetch,
        port: config.port.api,
    },
    (address) => {
        logger.info(`Listening to ${address.port}`);
    },
);
