import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import ms from '@fabricio-191/ms';
import { Command, type CommandContext, Declare } from 'seyfert';
const {
    dependencies: { seyfert: seyfertVersion },
} = (await readFile(join(process.cwd(), 'package.json')).then((x) =>
    JSON.parse(x.toString()),
)) as { dependencies: Record<string, string> };

@Declare({
    name: 'stats',
    description: 'See bot stats',
})
export default class StatsCommand extends Command {
    async run(ctx: CommandContext) {
        await ctx.deferReply();

        const wsUptime = await ctx.client.wsApi.uptime();

        const data: Record<string, string> = {};
        const memoryUsage = process.memoryUsage();
        data.rss = `${(memoryUsage.rss / 1024 ** 2).toFixed(3)} mb`;
        data.heapUsed = `${(memoryUsage.heapUsed / 1024 ** 2).toFixed(3)} mb`;
        data.heapTotal = `${(memoryUsage.heapTotal / 1024 ** 2).toFixed(3)} mb`;
        data.external = `${(memoryUsage.external / 1024 ** 2).toFixed(3)} mb`;
        data.arrayBuffers = `${(memoryUsage.arrayBuffers / 1024 ** 2).toFixed(3)} mb`;
        data['\nBot uptime'] = ms(process.uptime() * 1e3, {
            long: true,
            format: 'YMoDHMSMs',
        });
        data['WebSocket uptime'] = ms(wsUptime * 1e3, {
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
