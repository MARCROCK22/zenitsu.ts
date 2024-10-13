import { join } from 'node:path';
import { createClient } from '@redis/client';
import { config } from '@repo/config';
import { Client, type ParseClient, type UsingClient } from 'seyfert';
import type { GatewayDispatchPayload } from 'seyfert/lib/types';
import { ApiManager } from './api/apiManager.js';
import { WsManager } from './api/wsManager.js';

const client = new Client({
    getRC() {
        return config.rc;
    },
    commands: {
        defaults: {
            onRunError(ctx, error) {
                client.logger.error(
                    ctx.author.id,
                    ctx.author.username,
                    ctx.fullCommandName,
                    error,
                );
                const content = `\`\`\`${
                    error instanceof Error
                        ? (error.stack ?? error.message)
                        : `${error ?? 'Unknown error'}`
                }\`\`\``;

                return ctx.editOrReply({
                    content,
                });
            },
        },
    },
}) as unknown as UsingClient & Client;
client.ws = new WsManager();
client.api = new ApiManager();

await client.start({}, false);
await client.uploadCommands({
    cachePath: join(process.cwd(), '_seyfert_cache.json'),
});

const redisClient = createClient();

await redisClient.connect();
redisClient.subscribe('gateway', (message) => {
    const body = JSON.parse(message) as {
        s: number;
        p: GatewayDispatchPayload;
    };
    return client.gateway.options.handlePayload(body.s, body.p);
});

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> {
        ws: WsManager;
        api: ApiManager;
    }
}
