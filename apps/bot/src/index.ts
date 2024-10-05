import { join } from 'node:path';
import { createClient } from '@redis/client';
import { config } from '@repo/config';
import { Client, type ParseClient } from 'seyfert';
import type { GatewayDispatchPayload } from 'seyfert/lib/types';

const redisClient = createClient();
const client = new Client({
    getRC() {
        return config.rc;
    },
});

await redisClient.connect();
redisClient.subscribe('gateway', (message) => {
    const body = JSON.parse(message) as {
        s: number;
        p: GatewayDispatchPayload;
    };
    return client.gateway.options.handlePayload(body.s, body.p);
});

await client.start({}, false);
await client.uploadCommands({
    cachePath: join(process.cwd(), '_seyfert_cache.json'),
});

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> {}
}
