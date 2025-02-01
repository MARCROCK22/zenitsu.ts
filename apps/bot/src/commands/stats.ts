import {
    type CommandContext,
    createStringOption,
    Command,
    Declare
} from 'seyfert';
import { readFile } from 'node:fs/promises';
import ms from '@fabricio-191/ms';
import { Options } from 'seyfert';
import s, { Infer } from 'ajv-ts';
import { join } from 'node:path';

import type { statsResult } from '../api/_.js';
const {
    dependencies: { seyfert: seyfertVersion }
} = await readFile(join(process.cwd(), `package.json`)).then((x) => s.object({
    dependencies: s.object({
        seyfert: s.string()
    })
}).parse(JSON.parse(x.toString())));

const options = {
    app: createStringOption({
        description: `ola`,
        choices: [
            {
                name: `Bot`,
                value: `bot`
            },
            {
                name: `API`,
                value: `api`
            },
            {
                name: `WebSocket api`,
                value: `ws`
            }
        ] as const
    })
};

@Declare({
    name: `stats`,
    description: `See bot stats`
})
@Options(options)
export default class StatsCommand extends Command {
    async run(ctx: CommandContext<typeof options>) {
        await ctx.deferReply();
        ctx.options.app ??= `bot`;

        let stats: Infer<typeof statsResult>;

        switch (ctx.options.app) {
            case `api`:
            case `ws`:
                stats = await ctx.client[ctx.options.app].stats();
                break;
            case `bot`:
                stats = {
                    memoryUsage: process.memoryUsage(),
                    uptime: process.uptime()
                };
                break;
            default:
                throw new Error(`unexpected`);
        }

        const data: Record<string, string> = {};

        for (const i of [
            `rss`,
            `heapUsed`,
            `heapTotal`,
            `external`,
            `arrayBuffers`
        ] as const) {
            data[i] = `${(stats.memoryUsage[i] / 1_024 ** 2).toFixed(3)} mb`;
        }

        data.uptime = ms(stats.uptime * 1e3, {
            long: true,
            format: `YMoDHMSMs`
        });

        data[`Seyfert version`] = seyfertVersion;

        await ctx.editOrReply({
            content: Object.entries(data)
                .map(([key, value]) => `**${key}**: ${value}`)
                .join(`\n`)
        });
    }
}
