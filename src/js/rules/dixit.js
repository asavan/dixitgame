
import RoundStage from "./constants.js";
import {hide, mimic, guess, countScore} from "./phases.js";
import deckFunc from "../core/deck.js";
import handlersFunc from "../utils/handlers.js";
import core from "../core/basic.js";
import { assert } from "../utils/assert.js";

const BAD_MOVE = 0;
const SAME_ROUND = 1;
const NEXT_ROUND = 2;



function round(dataRound, logger, handlers) {
    const {players, storyteller, settings} = {...dataRound};
    let stage = RoundStage.BEGIN_ROUND;
    const nextMapper = {
        [RoundStage.BEGIN_ROUND]: hide,
        [RoundStage.HIDE]: mimic,
        [RoundStage.MIMIC]: guess,
        [RoundStage.GUESS]: countScore,
        [RoundStage.COUNT_SCORE]: null,
    };

    let curState = nextMapper[stage](Object.assign({}, settings, {players, storyteller}));
    const tryMove = async (data) => {
        const {playerIndex, state, card} = {...data};
        logger.log("tryMove", playerIndex, state, card);
        if (!curState.canMove(data)) {
            return BAD_MOVE;
        }
        curState.moveInner(data);
        await handlers.call("move", data);
        // animation
        while (curState.isReady()) {
            const countedState = curState.toJson();
            curState = nextMapper[curState.getRoundState()](countedState);
            if (!curState) {
                return NEXT_ROUND;
            }
            await handlers.call("changeState", curState.toJson());
            stage = curState.getRoundState();
        }
        return SAME_ROUND;
    };

    return {
        tryMove
    };
}

function game(data) {
    const {settings, rngEngine, logger, playersCount} = { ...data };
    const commands = [
        "shuffle",
        "deal",
        "move",
        "gameover",
        "changeState"
    ];

    const handlers = handlersFunc(commands);
    function on(name, f) {
        return handlers.on(name, f);
    }
    let storyteller = 0;
    let roundNum = 0;
    const direction = settings.direction;
    const players = Array(playersCount).fill([]);

    let curRound = round({players, storyteller, settings}, logger, handlers);
    const tryMove = async (data) => {
        const res = curRound.tryMove(data);
        if (res === NEXT_ROUND) {
            ++storyteller;
            ++roundNum;
            if (settings.maxScore) {
                await handlers.call("gameover", data);
                return;
            }
            await dealN(1);
            logger.log("Next round", roundNum);
            curRound = round({players, storyteller, settings}, logger, handlers);
        }
    };

    function report(callbackName, data) {
        return handlers.call(callbackName, data);
    }

    const onShuffle = (d) => report("shuffle", d);
    const deck = deckFunc.newShuffledDeck(onShuffle, rngEngine, settings.cardsCount);

    async function dealN(initialDealt) {
        assert(initialDealt*players.length < deck.size(), "Not enought cards to play");
        for (let round = 0; round < initialDealt; ++round) {
            const n = players.length;
            for (let i = 0; i < n; i++) {
                const dealIndex = core.nextPlayer(i, n, direction, storyteller);
                const currentPlayer = players[dealIndex].getIndex();
                await dealToPlayer(deck, currentPlayer);
            }
        }
    }
    async function dealToPlayer(deck, playerIndex) {
        if (deck == null || deck.size() === 0) {
            logger.error("deck is empty");
            return;
        }
        const card = deck.deal();
        if (card == null) {
            logger.error("deck is empty, should never happen");
            return;
        }
        players[playerIndex].push(card);
        await report("deal", {playerIndex, card});
        return card;
    }

    const start = async () => {
        await dealN(settings.cardsDeal);
    };

    return {
        tryMove,
        start,
        on
    };
}

export default {
    round,
    game
};
