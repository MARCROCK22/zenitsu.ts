import { type UUID, randomUUID } from 'node:crypto';
import {
    ActionRow,
    Button,
    type CommandContext,
    type RawFile,
    type UserStructure,
    type UsingClient,
} from 'seyfert';
import { ButtonStyle } from 'seyfert/lib/types/index.js';
import { TicTacToePiece } from '../games/tictactoe/constants.js';
import { TicTacToe } from '../games/tictactoe/index.js';

interface Recipient {
    userId: string;
    channelId: string;
    messageId: string;
}

interface TicTacToeGame {
    type: 'tictactoe';
    game: TicTacToe;
    recipients: Recipient[];
}

export type GenericGameDB = {
    type: TicTacToeGame['type'];
    game: Pick<TicTacToe, 'map' | 'lastTurn' | 'users'>;
};
export type GenericGame = TicTacToeGame;

export class GameManager {
    values = new Map<UUID, GenericGame>();
    relationships = new Map<string, UUID>();
    client: UsingClient;
    constructor(client: UsingClient) {
        this.client = client;
    }

    // async syncFromCache() {
    //     for (const [uuid, rawGame] of Object.entries(
    //         this.client.meowdb.all(),
    //     ) as [UUID, GenericGameDB][]) {
    //         switch (rawGame.type) {
    //             case 'tictactoe':
    //                 {
    //                     const temporalGame = new TicTacToe(['1', '1']);
    //                     temporalGame.users = rawGame.game.users;
    //                     temporalGame.lastTurn = rawGame.game.lastTurn;
    //                     temporalGame.map = rawGame.game.map;
    //                     this.client.games.values.set(uuid, {
    //                         type: rawGame.type,
    //                         game: temporalGame,
    //                     });
    //                     for (const i of rawGame.game.users) {
    //                         this.client.games.relationships.set(i, uuid);
    //                     }
    //                 }
    //                 break;
    //             default:
    //                 throw new Error('Unexpected');
    //         }
    //     }

    //     await writeFile(join(process.cwd(), 'cache', 'games.json'), '{}');
    // }

    generateUUID() {
        let uuid = randomUUID();
        while (this.values.has(uuid)) {
            uuid = randomUUID();
        }
        return uuid;
    }

    syncGame(users: string[], game: GenericGame) {
        const uuid = this.generateUUID();
        for (const user of users) {
            this.relationships.set(user, uuid);
        }
        this.values.set(uuid, game);
        return uuid;
    }

    hasGame(users: string[]) {
        return users.filter((user) => this.relationships.has(user));
    }

    getGameFromUsers(userId: string) {
        const uuid = this.relationships.get(userId);
        if (!uuid) {
            return;
        }
        return { uuid, game: this.values.get(uuid) };
    }

    deleteUserGames(users: string[]) {
        for (const user of users) {
            if (!this.relationships.has(user)) {
                continue;
            }
            const relation = this.relationships.get(user);
            if (!relation) {
                continue;
            }
            this.relationships.delete(user);
            if (!this.values.has(relation)) {
                continue;
            }
            this.values.delete(relation);
        }
    }

    createTicTacToeGame(users: [string, string], recipients: Recipient[]) {
        const hasGame = this.hasGame(users);
        if (hasGame.length > 0) {
            throw new Error(`${hasGame.join(', ')} has a game in progress`);
        }

        const game = new TicTacToe(users);

        return {
            game,
            uuid: this.syncGame(users, {
                type: 'tictactoe',
                game,
                recipients,
            }),
        };
    }

    async requestPlay(
        ctx: CommandContext,
        user: UserStructure,
        options: {
            wanna_play: string;
            game: GenericGame['type'];
        },
    ) {
        if (this.hasGame([ctx.author.id, user.id]).length > 0) {
            return ctx.write({
                content: '?xd',
            });
        }

        if (ctx.author.id === user.id) {
            return ctx.write({
                content: 'You win.',
            });
        }

        if (user.bot) {
            return ctx.write({
                content: '"beep boop"',
            });
        }

        let uuid: UUID;

        const message = await ctx.deferReply(false, true);

        switch (options.game) {
            case 'tictactoe':
                uuid = this.createTicTacToeGame(
                    [ctx.author.id, user.id],
                    [
                        {
                            channelId: ctx.channelId,
                            messageId: message.id,
                            userId: ctx.author.id,
                        },
                    ],
                ).uuid;
                break;
            default:
                throw new Error('Unexpected');
        }

        const accept = new Button()
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success)
            .setCustomId(
                `accept_${options.game}_${ctx.author.id}_${user.id}_${uuid}`,
            );

        const deny = new Button()
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)
            .setCustomId(
                `deny_${options.game}_${ctx.author.id}_${user.id}_${uuid}`,
            );

        await ctx.editOrReply({
            content: options.wanna_play,
            components: [new ActionRow<Button>().addComponents(accept, deny)],
        });
    }

    async getTicTacToeMessage(
        game: TicTacToe,
        authorId: string,
        userId: string,
        uuid: UUID,
    ) {
        const components: ActionRow<Button>[] = [];

        for (let y = 0; y < 3; y++) {
            const row = new ActionRow<Button>();
            for (let x = 0; x < 3; x++) {
                const i = y * 3 + x;
                const piece = game.map.at(i);
                row.addComponents(
                    new Button()
                        .setCustomId(
                            `move_tictactoe_${i}_${authorId}_${userId}_${uuid}`,
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
            body: {
                content: game.winner
                    ? `<@${game.winner}> won the game.`
                    : game.draw
                      ? `Draw between ${game.users.map((user) => `<@${user}>`).join(', ')}`
                      : `[${game.piece === TicTacToePiece.O ? 'O' : 'X'}] <@${game.user}>'s turn.`,
                components: components.map((row) => row.toJSON()),
            },
            files: [
                {
                    data: await this.client.api.drawTicTacToe(game),
                    filename: 'game.png',
                },
            ] satisfies RawFile[],
        };
    }
}
