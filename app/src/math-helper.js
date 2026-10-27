export function range(x, y) {
    return Array.from({ length: y - x + 1 }, (_, i) => x + i);
}

export function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function randInt(max) {
    return Math.floor(Math.random() * max)
}