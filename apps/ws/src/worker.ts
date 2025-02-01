import { WorkerClient, Logger } from 'seyfert';
import { config } from '@repo/config';

import { PotoSocket } from './socket.js';

const socket = new PotoSocket(
    new Logger({
        name: `[WS_0]`
    }),
    config.port.bot
);

const client = new WorkerClient({
    handlePayload(shardId, packet) {
        socket.send(shardId, packet);
    },
    getRC() {
        config.rc.locations.commands = undefined;
        config.rc.locations.components = undefined;
        config.rc.locations.events = undefined;
        config.rc.locations.langs = undefined;
        return config.rc;
    }
});

socket.connect();
await client.start();
