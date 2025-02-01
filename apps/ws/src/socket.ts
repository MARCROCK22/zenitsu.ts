import type { GatewayDispatchPayload } from 'seyfert/lib/types';
import type { Logger } from 'seyfert';

import { config } from '@repo/config';
import { WebSocket } from 'ws';

export class PotoSocket {
    socket?: WebSocket;

    logger: Logger;

    port: number;

    constructor(logger: Logger, port: number) {
        this.port = port;
        this.logger = logger;
    }

    connect() {
        this.socket = new WebSocket(`ws://localhost:${this.port}`);

        this.socket.onclose = () => {
            this.logger.info(`Socket closed, reconnecting in 2s`);
            setTimeout(() => {
                this.connect();
            }, 2e3);
        };

        this.socket.onerror = (err) => {
            this.logger.error(`socket error`, err);
        };

        this.socket.onopen = () => {
            this.logger.debug(`Connected to ${this.socket?.url}`);
        };
    }

    send(shardId: number, packet: GatewayDispatchPayload) {
        if (this.socket?.readyState !== WebSocket.OPEN) {
            return;
        }
        this.socket.send(
            JSON.stringify({
                shardId,
                packet,
                key: config.auth.ws
            })
        );
    }
}
