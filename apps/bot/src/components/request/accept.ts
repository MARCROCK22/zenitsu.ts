import type { UUID } from 'node:crypto';

import { type ComponentContext, ComponentCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

const regex =
    /accept_(tictactoe|connect4)_[0-9]{17,19}_[0-9]{17,19}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export default class Accept extends ComponentCommand {
    componentType = 'Button' as const;

    async run(ctx: ComponentContext<typeof this.componentType>) {
        const customIdSplit = ctx.customId.split('_');
        const gameType = customIdSplit[1];
        const authorId = customIdSplit[2];
        const userId = customIdSplit[3];
        const uuid = customIdSplit[4] as UUID;
        const rawGame = ctx.client.games.values.get(uuid);

        if (!rawGame) {
            return ctx.update({
                content: 'Game does not exists',
                components: []
            });
        }

        if (
            rawGame.type !== gameType ||
            ctx.client.games.hasGame([authorId, userId]).length !== 2
        ) {
            return ctx.update({
                content: 'Something went wrong...?',
                components: []
            });
        }

        if (userId !== ctx.author.id) {
            return ctx.write({
                content: '?',
                flags: MessageFlags.Ephemeral
            });
        }

        switch (rawGame.type) {
            case 'tictactoe': {
                const message = await ctx.client.games.getTicTacToeMessage(
                    rawGame.game,
                    authorId,
                    userId,
                    uuid
                );
                return ctx.update({
                    ...message.body,
                    files: message.files
                });
            }
            case 'connect4': {
                const message = await ctx.client.games.getConnect4Message(
                    rawGame.game,
                    authorId,
                    userId,
                    uuid
                );
                return ctx.update({
                    ...message.body,
                    files: message.files
                });
            }
            default:
                return ctx.update({
                    content: 'Unexpected',
                    components: []
                });
        }
    }

    filter(ctx: ComponentContext<typeof this.componentType>) {
        return Boolean(regex.exec(ctx.customId));
    }
}
