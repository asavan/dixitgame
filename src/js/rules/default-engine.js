import core from "../core/basic.js";
import RoundStage from "./constants.js";


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

export default function emptyEngine(settings, players) {
    const dealer = 0;
    const direction = 1;
    const gameState = core.GameStage.CHOOSE_DEALER;
    const roundState = RoundStage.BEGIN_ROUND;
    const maxScore = settings.maxScore;
    const cardsOnTable = [];
    const playersRaw = players.map(p => emptyPlayer(p.name));
    return {
        dealer,
        direction,
        gameState,
        roundState,
        cardsOnTable,
        playersRaw,
        maxScore
    };
}
