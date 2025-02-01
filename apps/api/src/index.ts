import { serve } from '@hono/node-server';
import { config } from '@repo/config';
import { Logger } from 'seyfert';
import { Hono } from 'hono';

import { drawTicTacToe } from './tictactoe/draw.js';
import { drawConnect4 } from './connect4/draw.js';

const app = new Hono();
const logger = new Logger({
    name: `[Z_API]`
});

// App.use((c, next) => {
//     Const auth = c.req.header('Authorization');
//     If (auth === config.auth.api) {
//         Return next();
//     }
//     Throw new HTTPException(418, {
//         Message: 'Invalid authorization header',
//     });
// });

app.get(`/stats`, (c) => c.json({
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
}));

app.get(`/tictactoe/display`, async (c) => {
    const table = (c.req.query(`table`) ?? ``).split(`,`).map(Number);
    const timeStart = performance.now();
    const result = (await drawTicTacToe(table)) as unknown as ArrayBuffer;
    const timeEnd = performance.now();
    logger.debug(`Took ${timeEnd - timeStart}ms to draw the tictactoe board`);
    return c.body(result);
});

app.get(`/connect4/display`, async (c) => {
    const table = (c.req.query(`table`) ?? ``)
        .split(`|`)
        .map((x) => x.split(`,`).map(Number));
    const timeStart = performance.now();
    const result = (await drawConnect4(table)) as unknown as ArrayBuffer;
    const timeEnd = performance.now();
    logger.debug(`Took ${timeEnd - timeStart}ms to draw the connect4 board`);
    return c.body(result);
});

serve(
    {
        fetch: app.fetch,
        port: config.port.api
    },
    (address) => {
        logger.info(`Listening to ${address.port}`);
    }
);
