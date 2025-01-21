import {
    type CommandContext,
    type UserStructure,
    type UsingClient,
    type RawFile,
    ActionRow,
    Button
} from 'seyfert';
import ModuleConnect4 from '@lil_marcrock22/connect4-ai';
import { ButtonStyle } from 'seyfert/lib/types/index.js';
import { randomUUID, type UUID } from 'node:crypto';

import { TicTacToePiece } from '../games/tictactoe/constants.js';
import { TicTacToe } from '../games/tictactoe/index.js';
import { chunk } from '../utils/functions.js';

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

interface Connect4Game {
    type: 'connect4';
    game: ModuleConnect4.Connect4<string>;
    recipients: Recipient[];
}

export type GenericGame = TicTacToeGame | Connect4Game;

export class GameManager {
    relationships = new Map<string, UUID>();

    values = new Map<UUID, GenericGame>();

    client: UsingClient;

    constructor(client: UsingClient) {
        this.client = client;
    }

    // Async syncFromCache() {
    //     For (const [uuid, rawGame] of Object.entries(
    //         This.client.meowdb.all(),
    //     ) as [UUID, GenericGameDB][]) {
    //         Switch (rawGame.type) {
    //             Case 'tictactoe':
    //                 {
    //                     Const temporalGame = new TicTacToe(['1', '1']);
    //                     TemporalGame.users = rawGame.game.users;
    //                     TemporalGame.lastTurn = rawGame.game.lastTurn;
    //                     TemporalGame.map = rawGame.game.map;
    //                     This.client.games.values.set(uuid, {
    //                         Type: rawGame.type,
    //                         Game: temporalGame,
    //                     });
    //                     For (const i of rawGame.game.users) {
    //                         This.client.games.relationships.set(i, uuid);
    //                     }
    //                 }
    //                 Break;
    //             Default:
    //                 Throw new Error('Unexpected');
    //         }
    //     }

    //     Await writeFile(join(process.cwd(), 'cache', 'games.json'), '{}');
    // }

    async requestPlay(
        ctx: CommandContext,
        user: UserStructure,
        options: {
            wanna_play: string;
            game: GenericGame['type'];
        }
    ) {
        if (this.hasGame([ctx.author.id, user.id]).length > 0) {
            return ctx.write({
                content: '?xd'
            });
        }

        if (ctx.author.id === user.id) {
            return ctx.write({
                content: 'You win.'
            });
        }

        if (user.bot) {
            return ctx.write({
                content: '"beep boop"'
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
                            userId: ctx.author.id
                        }
                    ]
                ).uuid;
                break;
            case 'connect4':
                uuid = this.createConnect4Game(
                    [ctx.author.id, user.id],
                    [
                        {
                            channelId: ctx.channelId,
                            messageId: message.id,
                            userId: ctx.author.id
                        }
                    ]
                ).uuid;
                break;
            default:
                throw new Error('Unexpected');
        }

        const accept = new Button()
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success)
            .setCustomId(
                `accept_${options.game}_${ctx.author.id}_${user.id}_${uuid}`
            );

        const deny = new Button()
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)
            .setCustomId(
                `deny_${options.game}_${ctx.author.id}_${user.id}_${uuid}`
            );

        await ctx.editOrReply({
            content: options.wanna_play,
            components: [new ActionRow<Button>().addComponents(accept, deny)]
        });
    }

    async getTicTacToeMessage(
        game: TicTacToe,
        authorId: string,
        userId: string,
        uuid: UUID
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
                            `move_tictactoe_${i}_${authorId}_${userId}_${uuid}`
                        )
                        .setLabel(
                            piece === TicTacToePiece.None
                                ? '~'
                                : piece === TicTacToePiece.X
                                    ? 'X'
                                    : 'O'
                        )
                        .setStyle(
                            piece === TicTacToePiece.None
                                ? ButtonStyle.Secondary
                                : piece === TicTacToePiece.X
                                    ? ButtonStyle.Danger
                                    : ButtonStyle.Primary
                        )
                        .setDisabled(
                            piece !== TicTacToePiece.None || game.finished
                        )
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
                        : `[${game.piece === TicTacToePiece.O
                            ? 'O'
                            : 'X'}] <@${game.user}>'s turn.`,
                components: components.map((row) => row.toJSON())
            },
            files: [
                {
                    data: await this.client.api.drawTicTacToe(game),
                    filename: 'game.png'
                }
            ] satisfies RawFile[]
        };
    }

    async getConnect4Message(
        game: ModuleConnect4.Connect4<string>,
        authorId: string,
        userId: string,
        uuid: UUID
    ) {
        const buttons: Button[] = [];

        for (let i = 0; i < game.columns; i++) {
            buttons.push(
                new Button()
                    .setCustomId(
                        `move_connect4_${i}_${authorId}_${userId}_${uuid}`
                    )
                    .setLabel(`${i + 1}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(
                        game.finished || game.map[i].at(-1)?.key !== 0
                    )
            );
        }

        const components: ActionRow<Button>[] = [];
        const buttonChunks = chunk(buttons, 5);
        for (const buttonChunk of buttonChunks) {
            components.push(new ActionRow<Button>().addComponents(...buttonChunk));
        }

        return {
            body: {
                content: game.winner
                    ? `<@${game.players[game.winner - 1]}> won the game.`
                    : game.tie
                        ? `Draw between ${game.players.map((user) => `<@${user}>`).join(', ')}`
                        : `[${game.turn === 1
                            ? 'RED'
                            : 'YELLOW'}] <@${game.players[game.turn - 1]}>'s turn.`,
                components: components.map((row) => row.toJSON())
            },
            files: [
                {
                    data: await this.client.api.drawConnect4(game),
                    filename: 'game.png'
                }
            ] satisfies RawFile[]
        };
    }

    createConnect4Game(users: [string, string], recipients: Recipient[]) {
        const hasGame = this.hasGame(users);
        if (hasGame.length > 0) {
            throw new Error(`${hasGame.join(', ')} has a game in progress`);
        }

        const game = new ModuleConnect4.Connect4<string>(
            {
                lengthArr: 6,
                columns: 7,
                necessaryToWin: 4
            },
            users
        );
        game.createBoard();

        return {
            game,
            uuid: this.syncGame(users, {
                type: 'connect4',
                game,
                recipients
            })
        };
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
                recipients
            })
        };
    }

    syncGame(users: string[], game: GenericGame) {
        const uuid = this.generateUUID();
        for (const user of users) {
            this.relationships.set(user, uuid);
        }
        this.values.set(uuid, game);
        return uuid;
    }

    getGameFromUsers(userId: string) {
        const uuid = this.relationships.get(userId);
        if (!uuid) {
            return;
        }
        return {
            uuid,
            game: this.values.get(uuid)
        };
    }

    generateUUID() {
        let uuid = randomUUID();
        while (this.values.has(uuid)) {
            uuid = randomUUID();
        }
        return uuid;
    }

    hasGame(users: string[]) {
        return users.filter((user) => this.relationships.has(user));
    }
}
