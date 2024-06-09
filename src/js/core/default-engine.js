import core from "./basic.js";

export function emptyPlayer(name) {
    return {score: 0, pile: [], name};
}

export function emptyPlayers(count) {
    const players = [];
    for (let i = 0; i < count; ++i) {
        players.push(emptyPlayer(""));
    }
    return players;
}

export default function emptyEngine(settings) {
    const dealer = 0;
    const direction = 1;
    const gameState = core.GameStage.CHOOSE_DEALER;
    const maxScore = settings.maxScore;
    return {
        dealer,
        direction,
        gameState,
        maxScore
    };
}
