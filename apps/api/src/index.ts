import { serve } from '@hono/node-server';
import { config } from '@repo/config';
import { Hono } from 'hono';
import { Logger } from 'seyfert';

const app = new Hono();
const logger = new Logger({
    name: '[Z_API]',
});

app.get('/stats', (c) =>
    c.json({
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
    }),
);

serve(
    {
        fetch: app.fetch,
        port: config.port.api,
    },
    (address) => {
        logger.info(`Listening to ${address.port}`);
    },
);
