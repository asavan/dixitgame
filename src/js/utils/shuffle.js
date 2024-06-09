export function shuffleArray(array, rngFunc) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rngFunc() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
