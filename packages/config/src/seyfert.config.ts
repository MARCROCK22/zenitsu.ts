import type { InternalRuntimeConfig } from 'seyfert/lib/client/base';

import { join } from 'node:path';
import { config } from 'seyfert';

process.loadEnvFile(join(process.cwd(), `..`, `..`, `.env`));

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    throw new Error(`Cannot start process without token`);
}

export const runtimeConfig: InternalRuntimeConfig = config.bot({
    locations: {
        base: `dist`,
        commands: `commands`,
        components: `components`,
        langs: `locales`
    },
    token: TOKEN,
    intents: [`GuildMessages`],
    debug: false
});
