import { join } from 'node:path';
import { config } from '@repo/config';
import { Client, type ParseClient, type UsingClient } from 'seyfert';
import type { GatewayDispatchPayload } from 'seyfert/lib/types/index.js';
import { WebSocketServer } from 'ws';
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

const server = new WebSocketServer({
    port: config.botPort,
});

server.on('connection', (socket) => {
    socket.on('message', (raw) => {
        const { shardId, packet, key } = JSON.parse(raw.toString()) as {
            shardId: number;
            packet: GatewayDispatchPayload;
            key: string;
        };
        if (key !== config.auth.ws) {
            // xd?
            return socket.close();
        }

        return client.gateway.options.handlePayload(shardId, packet);
    });
});

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> {
        ws: WsManager;
        api: ApiManager;
    }
}
