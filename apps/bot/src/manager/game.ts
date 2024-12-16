import { type UUID, randomUUID } from 'node:crypto';
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
    }

    hasGame(users: string[]) {
        return users.filter((user) => this.relationships.has(user));
    }

    createTicTacToeGame(users: [string, string]) {
        const hasGame = this.hasGame(users);
        if (hasGame.length > 0) {
            throw new Error(`${hasGame.join(', ')} has a game in progress`);
        }

        this.syncGame(users, {
            type: 'tictactoe',
            game: new TicTacToe(users),
        });
    }
}
