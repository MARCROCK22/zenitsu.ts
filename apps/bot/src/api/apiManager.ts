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
}
