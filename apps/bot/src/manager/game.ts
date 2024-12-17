import { type UUID, randomUUID } from 'node:crypto';
import {
    ActionRow,
    Button,
    type CommandContext,
    type ComponentContext,
    type InteractionGuildMemberStructure,
} from 'seyfert';
import type { ComponentInteractionMessageUpdate } from 'seyfert/lib/common/index.js';
import { ButtonStyle } from 'seyfert/lib/types/index.js';
import { TicTacToePiece } from '../games/tictactoe/constants.js';
import { TicTacToe } from '../games/tictactoe/index.js';

interface TicTacToeGame {
    type: 'tictactoe';
    game: TicTacToe;
}

type GenericGame = TicTacToeGame;

export class GameManager {
    games = new Map<UUID, GenericGame>();
    relationships = new Map<string, UUID>();

    generateUUID() {
        let uuid = randomUUID();
        while (this.games.has(uuid)) {
            uuid = randomUUID();
        }
        return uuid;
    }

    syncGame(users: string[], game: GenericGame) {
        const uuid = this.generateUUID();
        for (const user of users) {
            this.relationships.set(user, uuid);
        }
        this.games.set(uuid, game);
        return uuid;
    }

    hasGame(users: string[]) {
        return users.filter((user) => this.relationships.has(user));
    }

    getGame(userID: string) {
        const uuid = this.relationships.get(userID);
        if (!uuid) {
            return;
        }
        return { uuid, game: this.games.get(uuid) };
    }

    deleteGame(users: string[]) {
        for (const user of users) {
            if (!this.relationships.has(user)) {
                continue;
            }
            const relation = this.relationships.get(user);
            if (!relation) {
                continue;
            }
            if (!this.games.has(relation)) {
                continue;
            }
            this.games.delete(relation);
        }
    }

    createTicTacToeGame(users: [string, string]) {
        const hasGame = this.hasGame(users);
        if (hasGame.length > 0) {
            throw new Error(`${hasGame.join(', ')} has a game in progress`);
        }

        return this.syncGame(users, {
            type: 'tictactoe',
            game: new TicTacToe(users),
        });
    }

    async requestPlay(
        ctx: CommandContext,
        member: InteractionGuildMemberStructure,
        options: {
            wanna_play: string;
            game: GenericGame['type'];
        },
    ) {
        if (this.hasGame([ctx.author.id, member.id]).length > 0) {
            return ctx.write({
                content: '?xd',
            });
        }

        if (ctx.author.id === member.id) {
            return ctx.write({
                content: 'You win.',
            });
        }

        if (member.bot) {
            return ctx.write({
                content: '"beep boop"',
            });
        }

        let uuid: UUID;

        switch (options.game) {
            case 'tictactoe':
                uuid = this.createTicTacToeGame([ctx.author.id, member.id]);
                break;
            default:
                throw new Error('Unexpected');
        }

        const accept = new Button()
            .setLabel('Accept')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(
                `accept_${options.game}_${ctx.author.id}_${member.id}_${uuid}`,
            );

        const deny = new Button()
            .setLabel('Deny')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(
                `deny_${options.game}_${ctx.author.id}_${member.id}_${uuid}`,
            );

        await ctx.write({
            content: options.wanna_play,
            components: [new ActionRow<Button>().addComponents(accept, deny)],
        });
    }

    getTicTacToeMessage(
        game: TicTacToe,
        ctx: ComponentContext,
        userID: string,
        uuid: UUID,
    ): ComponentInteractionMessageUpdate {
        const components: ActionRow<Button>[] = [];

        for (let y = 0; y < 3; y++) {
            const row = new ActionRow<Button>();
            for (let x = 0; x < 3; x++) {
                const i = y * 3 + x;
                const piece = game.map.at(i);
                row.addComponents(
                    new Button()
                        .setCustomId(
                            `move_tictactoe_${i}_${ctx.author.id}_${userID}_${uuid}`,
                        )
                        .setLabel(
                            piece === TicTacToePiece.None
                                ? '~'
                                : piece === TicTacToePiece.X
                                  ? 'X'
                                  : 'O',
                        )
                        .setStyle(
                            piece === TicTacToePiece.None
                                ? ButtonStyle.Secondary
                                : piece === TicTacToePiece.X
                                  ? ButtonStyle.Danger
                                  : ButtonStyle.Primary,
                        )
                        .setDisabled(
                            piece !== TicTacToePiece.None || game.finished,
                        ),
                );
            }
            components.push(row);
        }

        return {
            content: game.winner
                ? `<@${game.winner}> won the game.`
                : game.draw
                  ? `Draw between ${game.users.map((user) => `<@${user}>`).join(', ')}`
                  : `<@${game.user}>'s turn.`,
            components,
        };
    }

    async initialTicTacToeMessage(ctx: ComponentContext, userID: string) {
        const rawGame = this.getGame(ctx.author.id);
        if (!rawGame || rawGame.game?.type !== 'tictactoe') {
            throw new Error('Unexpected');
        }
        const {
            game: { game },
            uuid,
        } = rawGame;

        const body = this.getTicTacToeMessage(game, ctx, userID, uuid);

        await ctx.editOrReply(body);
    }
}
