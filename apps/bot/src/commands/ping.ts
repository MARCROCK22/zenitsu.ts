import { type CommandContext, Command, Declare } from 'seyfert';

@Declare({
    name: `ping`,
    description: `pong`
})
export default class PingCommand extends Command {
    async run(ctx: CommandContext) {
        await ctx.deferReply();

        const info = await ctx.client.ws.shardsInfo();
        const content: string[] = [];

        for (const i of info) {
            content.push(
                `WorkerId: ${i.workerId}\n  Shards:\n    ${i.shards
                    .map((shard) => `#${shard.id} ${shard.latency
                        ? `${shard.latency}ms`
                        : `Connecting`}`)
                    .join(`, `)}`
            );
        }
        await ctx.editOrReply({
            content: `\`\`\`${content.join(`\n`)}\`\`\`\n-# ShardId: ${ctx.shardId}`
        });
    }
}
