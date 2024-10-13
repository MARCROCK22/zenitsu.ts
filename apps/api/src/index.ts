import { serve } from '@hono/node-server';
import { config } from '@repo/config';
import { Hono } from 'hono';
import { Image } from 'imagescript';

const app = new Hono();

app.get('/test', async (c) => {
    return c.body(
        await new Image(28e1, 22e1).fill(Math.random() * 0xffffffff).encode(),
    );
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
        port: config.apiPort,
    },
    (address) => {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log(`Listening to ${address.port}`);
    },
);
