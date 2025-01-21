import { HTTPException } from 'hono/http-exception';
import { WorkerManager, Logger } from 'seyfert';
import { serve } from '@hono/node-server';
import { config } from '@repo/config';
import { join } from 'node:path';
import { Hono } from 'hono';

const manager = new WorkerManager({
    mode: 'clusters',
    path: join(process.cwd(), 'dist', 'worker.js'),
    token: config.rc.token,
    intents: config.rc.intents,
    debug: config.rc.debug,
    getRC() {
        return config.rc;
    }
});

await manager.start();

const logger = new Logger({
    name: '[APIWebSocket]'
});

const app = new Hono();

app.use((c, next) => {
    const auth = c.req.header('Authorization');
    if (auth === config.auth.ws) {
        return next();
    }
    throw new HTTPException(418, {
        message: 'Invalid authorization header'
    });
});

app.get('/info', async (c) => {
    const workersInfo = await manager.tellWorkers((client) => ({
        shards: [...client.shards.values()].map((shard) => ({
            data: shard.data,
            heart: {
                ack: shard.heart.ack,
                interval: shard.heart.interval,
                lastAck: shard.heart.lastAck,
                lastBeat: shard.heart.lastBeat
            },
            latency: shard.latency,
            id: shard.id
        })),
        workerId: client.workerId
    }), {});

    return c.json(workersInfo);
});

app.get('/stats', (c) => c.json({
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
}));

serve(
    {
        fetch: app.fetch,
        port: config.port.ws
    },
    (address) => {
        logger.info(`Listening to ${address.port}`);
    }
);
