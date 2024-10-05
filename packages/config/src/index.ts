import { runtimeConfig } from './seyfert.config.js';

const WS_PORT = Number(process.env.WS_PORT);

if (!WS_PORT) {
    throw new Error('Cannot start process without WS_PORT');
}

const config = {
    rc: runtimeConfig,
    wsPort: WS_PORT,
};

export { config };
