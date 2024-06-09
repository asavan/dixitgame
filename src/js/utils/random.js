function randomInteger(min, max, rngFunc) {
    const rand = min + rngFunc() * (max - min);
    return Math.floor(rand);
}

function randomEl(arr, rngFunc) {
    return arr[Math.floor(rngFunc() * arr.length)];
}

function makeId(length, rngFunc) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(rngFunc() * charactersLength));
    }
    return result;
}



export default {
    makeId,
    randomEl,
    randomInteger
};
