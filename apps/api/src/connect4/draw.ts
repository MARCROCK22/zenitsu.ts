import { Image } from 'imagescript';

// Const assets = (...path: string[]) =>
//     Join(process.cwd(), '..', '..', 'assets', 'connect4', ...path);

export function drawConnect4(table: number[][]) {
    const radius = 50;
    const gap = 20;
    const boxSize = radius * 2 + gap;

    const canvas = new Image(
        table[0].length * boxSize,
        table.length * boxSize + boxSize / 2
    ).fill(0x4287f3ff);

    for (let y = 0; y < table.length; y++) {
        for (let x = 0; x < table[y].length; x++) {
            const color = table[y][x];
            if (color === 1) {
                canvas.drawCircle(
                    x * boxSize + boxSize / 2,
                    y * boxSize + boxSize / 2,
                    radius,
                    0xff0000ff
                );
            } else if (color === 2) {
                canvas.drawCircle(
                    x * boxSize + boxSize / 2,
                    y * boxSize + boxSize / 2,
                    radius,
                    0xffff00ff
                );
            }
        }
    }

    return canvas.encode();
}
