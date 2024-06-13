import RoundStage from "./constants.js";
import {hide, mimic, guess, countScore, applyScore} from "./phases.js";
import deckFunc from "../core/deck.js";
import handlersFunc from "../utils/handlers.js";
import core from "../core/basic.js";
import { assert } from "../utils/assert.js";

const BAD_MOVE = 0;
const SAME_ROUND = 1;
const NEXT_ROUND = 2;

function calcWinners(maxScore, scoreMap) {
    const winners = [];
    for (let i = 0; i < scoreMap.length; ++i) {
        const score = scoreMap[i];
        if (score === maxScore) {
            winners.push(i);
        }
    }
    return winners;
}

async function round(dataRound) {
    const {logger, handlers} = {...dataRound};
    logger.log("round started ", dataRound);
    let stage = RoundStage.BEGIN_ROUND;
    const nextMapper = {
        [RoundStage.BEGIN_ROUND]: hide,
        [RoundStage.HIDE]: mimic,
        [RoundStage.MIMIC]: guess,
        [RoundStage.GUESS]: countScore,
        [RoundStage.COUNT_SCORE]: applyScore,
        [RoundStage.APPLY_SCORE]: null,
    };

    let curState = nextMapper[stage]({...dataRound});
    ++stage;

    const tryMove = async (data) => {
        const {playerIndex, state, card} = {...data};
        logger.log("tryMove", playerIndex, state, card, curState.getRoundState());
        if (!curState.canMove(data)) {
            logger.log("tryMoveBad");
            return BAD_MOVE;
        }
        await curState.moveInner(data);
        logger.log("tryMove Before move");
        await handlers.call("move", {...data, roundState: curState.getRoundState()});
        logger.log("tryMove After move");

        // animation
        while (curState.isReady()) {
            logger.log("tryMove isReady", curState.getRoundState());
            const nextStateFunc = nextMapper[curState.getRoundState()];
            if (!nextStateFunc) {
                logger.log("round exit");
                ++stage;
                await handlers.call("changeState", {...curState.toJson(), stage});
                return NEXT_ROUND;
            }
            const countedState = curState.toJson();
            curState = nextStateFunc({...dataRound, ...countedState});
            ++stage;
            assert(stage === curState.getRoundState(), "stage not sequensed");
            await handlers.call("changeState", {...curState.toJson(), stage});
        }
        return SAME_ROUND;
    };

    await handlers.call("changeState", {...curState.toJson(), stage});
    return {
        tryMove
    };
}

function game(data) {
    const {settings, rngEngine, delay, logger, playersCount} = { ...data };
    const commands = [
        "start",
        "shuffle",
        "deal",
        "move",
        "gameover",
        "roundover",
        "newround",
        "changeState"
    ];

    const handlers = handlersFunc(commands);
    function report(callbackName, data) {
        return handlers.call(callbackName, data);
    }


    let storyteller = 0;
    let roundNum = 0;
    const scoreMap = Array(playersCount).fill(0);
    const direction = settings.direction;
    const players = Array(playersCount).fill([]);

    let curRound;
    let deck;

    function newRound() {
        return round({...settings, players, storyteller, scoreMap, logger, handlers});
    }

    const tryMove = async (data) => {
        const res = await curRound.tryMove(data);
        logger.log("game try move", res);
        if (res === NEXT_ROUND) {
            await handlers.call("roundover", data);
            storyteller = core.nextPlayer(0, playersCount, direction, storyteller);
            ++roundNum;
            const maxScore = scoreMap.reduce((acc, s) => acc < s ? s : acc, 0);
            if (settings.maxScore <= maxScore) {
                logger.log("game try move4");
                await handlers.call("gameover", {winners: calcWinners(maxScore, scoreMap)});
                return;
            }
            await handlers.call("newround", data);
            await dealN(1);
            logger.log("Next round", roundNum);
            curRound = await newRound();
            logger.log("game try move8");
        }
    };

    const onShuffle = (d) => report("shuffle", d);

    async function dealN(initialDealt) {
        logger.log("dealN", deck);
        assert(initialDealt * playersCount < deck.size(), "Not enought cards to play");
        for (let round = 0; round < initialDealt; ++round) {
            for (let i = 0; i < playersCount; i++) {
                const currentPlayer = core.nextPlayer(i, playersCount, direction, storyteller);
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

    const start = async (data) => {
        await report("start", data);
        await delay(200);
        curRound = await newRound();
        deck = await deckFunc.newShuffledDeck(onShuffle, rngEngine, settings.cardsCount);
        await dealN(settings.cardsDeal);
    };

    const actionKeys = handlers.actionKeys;
    const on = handlers.on;

    return {
        tryMove,
        start,
        actionKeys,
        on
    };
}

export default {
    round,
    game
};
