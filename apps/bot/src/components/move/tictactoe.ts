import type { UUID } from 'node:crypto';

import { type ComponentContext, ComponentCommand } from 'seyfert';

const regex =
    /move_tictactoe_[0-8]{1,1}_[0-9]{17,19}_[0-9]{17,19}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export default class MoveTicTacToe extends ComponentCommand {
    componentType = 'Button' as const;

    async run(ctx: ComponentContext<typeof this.componentType>) {
        const customIdSplit = ctx.customId.split('_');
        const move = Number(customIdSplit[2]);
        const authorId = customIdSplit[3];
        const userId = customIdSplit[4];
        const uuid = customIdSplit[5] as UUID;

        if (!ctx.client.games.values.has(uuid)) {
            return ctx.update({
                content: 'Game does not exists',
                components: []
            });
        }

        if (ctx.client.games.hasGame([authorId, userId]).length !== 2) {
            return ctx.update({
                content: 'Something went wrong...?',
                components: []
            });
        }

        const rawGame = ctx.client.games.values.get(uuid);
        if (!rawGame || rawGame.type !== 'tictactoe') {
            throw new Error('Unexpected');
        }

        if (!rawGame.game.canPlay(move, ctx.author.id)) {
            return ctx.deferUpdate();
        }
        rawGame.game.play(move, ctx.author.id);

        if (rawGame.game.finished) {
            ctx.client.games.deleteUserGames([authorId, userId]);
        }

        const message = await ctx.client.games.getTicTacToeMessage(
            rawGame.game,
            authorId,
            userId,
            uuid
        );

        await ctx.update({
            ...message.body,
            files: message.files
        });

        for (const i of rawGame.recipients) {
            if (i.messageId === ctx.interaction.message.id) {
                continue;
            }

            await ctx.client.proxy
                .channels(i.channelId)
                .messages(i.messageId)
                .patch(message);
        }
    }

    filter(ctx: ComponentContext<typeof this.componentType>) {
        return Boolean(regex.exec(ctx.customId));
    }
}
