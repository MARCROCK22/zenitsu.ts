import { join } from 'node:path';
import { config } from 'seyfert';
import type { InternalRuntimeConfig } from 'seyfert/lib/client/base';

process.loadEnvFile(join(process.cwd(), '..', '..', '.env'));

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    throw new Error('Cannot start process without token');
}

export const runtimeConfig: InternalRuntimeConfig = config.bot({
    locations: {
        base: 'src',
        output: 'dist',
        commands: 'commands',
    },
    token: TOKEN,
    intents: ['GuildMessages'],
    debug: false,
});
