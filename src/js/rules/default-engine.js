import core from "../core/basic.js";
import RoundStage from "./constants.js";
import urlGenerator from "../views/get_image_url.js";


export function emptyPlayer(name, externalId) {
    return {score: 0, pile: [], name, externalId};
}

export default function emptyEngine(settings, players, rngEngine) {
    const dealer = 0;
    const direction = 1;
    const gameState = core.GameStage.CHOOSE_DEALER;
    const stage = RoundStage.BEGIN_ROUND;
    const maxScore = settings.maxScore;
    const cardsOnTable = [];
    const votesMap = [];
    const playersRaw = players.map(p => emptyPlayer(p.name, p.externalId));
    const urlGenRaw = urlGenerator().makeKUrlGen(settings.cardsCount, rngEngine).getData();
    return {
        dealer,
        direction,
        gameState,
        stage,
        cardsOnTable,
        votesMap,
        playersRaw,
        urlGenRaw,
        maxScore
    };
}
