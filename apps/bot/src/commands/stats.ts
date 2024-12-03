import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import ms from '@fabricio-191/ms';
import type { Infer } from 'ajv-ts';
import {
    Command,
    type CommandContext,
    Declare,
    createStringOption,
} from 'seyfert';
import { Options } from 'seyfert';
import type { statsResult } from '../api/_.js';
const {
    dependencies: { seyfert: seyfertVersion },
} = (await readFile(join(process.cwd(), 'package.json')).then((x) =>
    JSON.parse(x.toString()),
)) as { dependencies: Record<string, string> };

const options = {
    app: createStringOption({
        description: 'ola',
        choices: [
            {
                name: 'Bot',
                value: 'bot',
            },
            {
                name: 'API',
                value: 'api',
            },
            {
                name: 'WebSocket api',
                value: 'ws',
            },
        ] as const,
    }),
};

@Declare({
    name: 'stats',
    description: 'See bot stats',
})
@Options(options)
export default class StatsCommand extends Command {
    async run(ctx: CommandContext<typeof options>) {
        await ctx.deferReply();
        ctx.options.app ??= 'bot';

        let stats: Infer<typeof statsResult>;

        switch (ctx.options.app) {
            case 'api':
            case 'ws':
                stats = await ctx.client[ctx.options.app].stats();
                break;
            case 'bot':
                stats = {
                    memoryUsage: process.memoryUsage(),
                    uptime: process.uptime(),
                };
                break;
            default:
                throw new Error('unexpected');
        }

        const data: Record<string, string> = {};

        for (const i of [
            'rss',
            'heapUsed',
            'heapTotal',
            'external',
            'arrayBuffers',
        ] as const) {
            data[i] = `${(stats.memoryUsage[i] / 1024 ** 2).toFixed(3)} mb`;
        }

        data.uptime = ms(stats.uptime * 1e3, {
            long: true,
            format: 'YMoDHMSMs',
        });

        data['Seyfert version'] = seyfertVersion;

        await ctx.editOrReply({
            content: Object.entries(data)
                .map(([key, value]) => {
                    return `**${key}**: ${value}`;
                })
                .join('\n'),
        });
    }
}
