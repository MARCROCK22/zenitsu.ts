export function shuffleArray<T extends unknown[]>(array: T): T {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
export function chunk<T extends unknown[]>(array: T, chunks: number) {
    let index = 0;
    let resIndex = 0;
    const result: T[] = new Array(Math.ceil(array.length / chunks));

    while (index < array.length) {
        const end = index + chunks;
        result[resIndex] = array.slice(index, end) as T;
        index = end;
        resIndex++;
    }

    return result;
}
