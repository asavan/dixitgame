const GameStage = Object.freeze({
    CHOOSE_DEALER: 1,
    DEALING: 2,
    ROUND: 3,
    ROUND_OVER: 4,
    GAME_OVER: 5
});

function nextPlayer(diff, size, direction, cur) {
    return (cur + (diff + 1) * direction + size) % size;
}

export default {
    GameStage,
    nextPlayer
};
