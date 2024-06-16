import core from "../core/basic.js";
import RoundStage from "./constants.js";


export function emptyPlayer(name, externalId) {
    return {score: 0, pile: [], name, externalId};
}

export default function emptyEngine(settings) {
    const dealer = 0;
    const direction = 1;
    const gameState = core.GameStage.CHOOSE_DEALER;
    const stage = RoundStage.BEGIN_ROUND;
    const maxScore = settings.maxScore;
    const cardsOnTable = [];
    const votesMap = [];

    return {
        dealer,
        direction,
        gameState,
        stage,
        cardsOnTable,
        votesMap,
        maxScore
    };
}
