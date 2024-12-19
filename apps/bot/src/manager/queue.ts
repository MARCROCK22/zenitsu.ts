import type { UsingClient } from 'seyfert';
import type { GenericGame } from './game.js';

export interface UserQueued {
    id: string;
    messageId: string;
    channelId: string;
    type: GenericGame['type'];
}

export class QueueManager {
    values = new Map<string, UserQueued>();
    client: UsingClient;
    constructor(client: UsingClient) {
        this.client = client;
    }

    join(user: UserQueued) {
        this.values.set(user.id, user);
    }

    has(user: string) {
        return this.values.has(user);
    }

    start() {
        setInterval(async () => {
            const usersMap = Map.groupBy(
                Array.from(this.values.values()),
                (u) => u.type,
            );

            for (let [type, users] of usersMap) {
                if (users.length < 2) {
                    continue;
                }
                users = users.slice(0, 2);

                switch (type) {
                    case 'tictactoe':
                        {
                            for (const user of users) {
                                this.values.delete(user.id);
                            }
                            const { game, uuid } =
                                this.client.games.createTicTacToeGame(
                                    users.map((u) => u.id) as [string, string],
                                    users.map((u) => ({
                                        channelId: u.channelId,
                                        messageId: u.messageId,
                                        userId: u.id,
                                    })),
                                );

                            const { body, files } =
                                await this.client.games.getTicTacToeMessage(
                                    game,
                                    users[0].id,
                                    users[1].id,
                                    uuid,
                                );

                            for (const i of users) {
                                await this.client.proxy
                                    .channels(i.channelId)
                                    .messages(i.messageId)
                                    .patch({
                                        body,
                                        files,
                                    });
                            }
                        }
                        break;
                    case 'connect4':
                        {
                            for (const user of users) {
                                this.values.delete(user.id);
                            }
                            const { game, uuid } =
                                this.client.games.createConnect4Game(
                                    users.map((u) => u.id) as [string, string],
                                    users.map((u) => ({
                                        channelId: u.channelId,
                                        messageId: u.messageId,
                                        userId: u.id,
                                    })),
                                );

                            const { body, files } =
                                await this.client.games.getConnect4Message(
                                    game,
                                    users[0].id,
                                    users[1].id,
                                    uuid,
                                );

                            for (const i of users) {
                                await this.client.proxy
                                    .channels(i.channelId)
                                    .messages(i.messageId)
                                    .patch({
                                        body,
                                        files,
                                    });
                            }
                        }
                        break;
                    default:
                        throw new Error('Unexpected');
                }
            }
        }, 1000);
    }
}
