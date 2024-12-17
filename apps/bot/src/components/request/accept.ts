import type { UUID } from 'node:crypto';
import { ComponentCommand, type ComponentContext } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

const regex =
    /accept_(tictactoe)_[0-9]{17,19}_[0-9]{17,19}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export default class Accept extends ComponentCommand {
    componentType = 'Button' as const;

    filter(ctx: ComponentContext<typeof this.componentType>) {
        return !!ctx.customId.match(regex);
    }

    run(ctx: ComponentContext<typeof this.componentType>) {
        const customIdSplit = ctx.customId.split('_');
        const gameType = customIdSplit[1];
        const authorID = customIdSplit[2];
        const userID = customIdSplit[3];
        const uuid = customIdSplit[4] as UUID;
        const rawGame = ctx.client.games.values.get(uuid);

        if (!rawGame) {
            return ctx.update({
                content: 'Game does not exists',
                components: [],
            });
        }

        if (
            rawGame.type !== gameType ||
            ctx.client.games.hasGame([authorID, userID]).length !== 2
        ) {
            return ctx.update({
                content: 'Something went wrong...?',
                components: [],
            });
        }

        if (userID !== ctx.author.id) {
            return ctx.write({
                content: '?',
                flags: MessageFlags.Ephemeral,
            });
        }

        switch (rawGame.type) {
            case 'tictactoe': {
                const message = ctx.client.games.getTicTacToeMessage(
                    rawGame.game,
                    ctx,
                    userID,
                    uuid,
                );
                return ctx.update(message);
            }
            default:
                return ctx.update({
                    content: 'Unexpected',
                    components: [],
                });
        }
    }
}