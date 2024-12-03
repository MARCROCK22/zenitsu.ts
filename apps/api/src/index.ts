import { serve } from '@hono/node-server';
import { config } from '@repo/config';
import { Hono } from 'hono';

const app = new Hono();

app.get('/stats', (c) =>
    c.json({
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
    }),
);

serve(
    {
        fetch: app.fetch,
        port: config.apiPort,
    },
    (address) => {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log(`Listening to ${address.port}`);
    },
);
