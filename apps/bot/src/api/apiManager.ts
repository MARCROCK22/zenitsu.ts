import type ModuleConnect4 from '@lil_marcrock22/connect4-ai/index.js';
import { config } from '@repo/config';
import type { TicTacToe } from '../games/tictactoe/index.js';
import { statsResult } from './_.js';

export class ApiManager {
    private baseURL = `http://localhost:${config.port.api}`;

    async stats() {
        const response = await fetch(`${this.baseURL}/stats`, {
            headers: {
                authorization: config.auth.api,
            },
        });
        const result = await response.json();
        return statsResult.parse(result);
    }

    async drawTicTacToe(game: TicTacToe) {
        const response = await fetch(
            `${this.baseURL}/tictactoe/display?table=${game.map.join(',')}`,
            {
                headers: {
                    authorization: config.auth.api,
                },
            },
        );
        return response.arrayBuffer();
    }

    async drawConnect4(game: ModuleConnect4.Connect4<string>) {
        const map: number[][] = [];

        for (let i = 0; i < game.columns; i++) {
            const values = game.map[i].toReversed();

            for (let j = 0; j < values.length; j++) {
                map[j] ??= [];
                map[j].push(values[j].key);
            }
        }

        const response = await fetch(
            `${this.baseURL}/connect4/display?table=${map.map((row) => row.join(',')).join('|')}`,
            {
                headers: {
                    authorization: config.auth.api,
                },
            },
        );
        return response.arrayBuffer();
    }
}
