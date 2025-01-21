import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { decodeImage } from '../utils/image.js';

const assets = (...path: string[]) => join(process.cwd(), '..', '..', 'assets', 'tictactoe', ...path);

const background = await decodeImage(
    await readFile(assets('default', 'background.png'))
);
const xImage = await decodeImage(await readFile(assets('default', 'x.png')));
const oImage = await decodeImage(await readFile(assets('default', 'o.png')));

export function drawTicTacToe(table: number[]) {
    if (table.length !== 9) {
        throw new Error('Table must be 3x3');
    }

    const canvas = background.clone();

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            const i = y * 3 + x;
            const piece = table.at(i);
            if (piece === undefined) {
                throw new Error('Unexpected');
            }
            if (piece === 0) {
                continue;
            }
            const xPos = x * (canvas.width / 3) + 75;
            const yPos = y * (canvas.height / 3) + 75;
            if (piece === 1) {
                canvas.composite(xImage, xPos, yPos);
            } else if (piece === 2) {
                canvas.composite(oImage, xPos, yPos);
            } else {
                throw new Error('Unexpected');
            }
        }
    }

    return canvas.encode();
}
