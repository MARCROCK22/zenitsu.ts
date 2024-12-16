import { shuffleArray } from '../../utils/functions.js';
import { TicTacToePiece } from './constants.js';

export class TicTacToe {
    static winnablePositions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    users: [string, string];
    map = Array.from({ length: 9 }, () => TicTacToePiece.None);
    lastTurn = 0;

    winner?: string;
    draw?: boolean;

    constructor(users: [string, string]) {
        this.users = shuffleArray(users);
    }

    get turn() {
        // Math.abs(this.__lastTurn - 1)
        return this.lastTurn === 0 ? 1 : 0;
    }

    get user() {
        return this.users[this.turn];
    }

    get piece() {
        return this.turn === 1 ? TicTacToePiece.X : TicTacToePiece.O;
    }

    get finished() {
        return this.draw || this.winner !== undefined;
    }

    play(played: number, userID: string) {
        if (!this.canPlay(played, userID)) {
            throw new Error(`Can't play ${played}.`);
        }
        this.map[played] = this.piece;

        if (
            TicTacToe.winnablePositions.find((p) =>
                p.every((x) => this.map[x] === TicTacToePiece.X),
            ) ||
            TicTacToe.winnablePositions.find((p) =>
                p.every((x) => this.map[x] === TicTacToePiece.O),
            )
        ) {
            this.winner = this.user;
            return;
        }
        if (this.map.every((x) => x)) {
            this.draw = true;
            return;
        }
        this.lastTurn = this.turn;
    }

    canPlay(played: number, userID: string) {
        return (
            userID === this.user && this.map.at(played) === TicTacToePiece.None
        );
    }
}
