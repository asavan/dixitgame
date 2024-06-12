import core from "../core/basic.js";
import RoundStage from "./constants.js";


export function emptyPlayer(name, externalId) {
    return {score: 0, pile: [], name, externalId};
}

export default function emptyEngine(settings, players) {
    const dealer = 0;
    const direction = 1;
    const gameState = core.GameStage.CHOOSE_DEALER;
    const roundState = RoundStage.BEGIN_ROUND;
    const maxScore = settings.maxScore;
    const cardsOnTable = [];
    const playersRaw = players.map(p => emptyPlayer(p.name, p.externalId));
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
