
import RoundStage from "./constants.js";
import {hide, mimic, guess, countScore, applyScore, roundBegin} from "./phases.js";
import deckFunc from "../core/deck.js";
import handlersFunc from "../utils/handlers.js";
import core from "../core/basic.js";
import { assert } from "../utils/assert.js";

const BAD_MOVE = 0;
const SAME_ROUND = 1;
const NEXT_ROUND = 2;



function round(dataRound) {
    const {logger, handlers} = {...dataRound};
    let stage = RoundStage.BEGIN_ROUND;
    const nextMapper = {
        [RoundStage.BEGIN_ROUND]: hide,
        [RoundStage.HIDE]: mimic,
        [RoundStage.MIMIC]: guess,
        [RoundStage.GUESS]: countScore,
        [RoundStage.COUNT_SCORE]: applyScore,
        [RoundStage.APPLY_SCORE]: null,
    };

    let curState = roundBegin(dataRound);
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
            logger.log("tryMove isReady");
            const countedState = curState.toJson();
            curState = nextMapper[curState.getRoundState()]({...dataRound, ...countedState});
            if (!curState) {
                return NEXT_ROUND;
            }
            stage = curState.getRoundState();
            await handlers.call("changeState", {...curState.toJson(), stage});
        }
        return SAME_ROUND;
    };

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
    function on(name, f) {
        return handlers.on(name, f);
    }
    let storyteller = 0;
    let roundNum = 0;
    const scoreMap = Array(playersCount).fill(0); 
    const direction = settings.direction;
    const players = Array(playersCount).fill([]);

    let curRound = round({...settings, players, storyteller, scoreMap, logger, handlers});
    const tryMove = async (data) => {
        const res = curRound.tryMove(data);
        if (res === NEXT_ROUND) {
            await handlers.call("roundover", data);
            ++storyteller;
            ++roundNum;
            if (settings.maxScore) {
                await handlers.call("gameover", data);
                return;
            }
            await handlers.call("newround", data);
            await dealN(1);
            logger.log("Next round", roundNum);
            curRound = round({players, storyteller, settings}, logger, handlers);
        }
    };

    function report(callbackName, data) {
        return handlers.call(callbackName, data);
    }

    const onShuffle = (d) => report("shuffle", d);
    let deck;

    async function dealN(initialDealt, deck) {
        logger.log("dealN", deck);
        const n = players.length;
        assert(initialDealt * n < deck.size(), "Not enought cards to play");
        for (let round = 0; round < initialDealt; ++round) {
            for (let i = 0; i < n; i++) {
                const currentPlayer = core.nextPlayer(i, n, direction, storyteller);
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
        deck = await deckFunc.newShuffledDeck(onShuffle, rngEngine, settings.cardsCount);
        await dealN(settings.cardsDeal, deck);
    };

    const actionKeys = handlers.actionKeys;

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
