import {assert} from "../utils/assert.js";
import RoundStage from "./constants.js";


function checkSanity(state) {
    const {players, storyteller} = {...state};
    assert(players.length > 0);
    assert(storyteller >= 0 && storyteller < players.length);
}

function handMoveChecker({players, cardsOnTable, allowChangeMove, roundState, logger}) {
    const check = ({playerIndex, state, card}) => {
        if (state !== roundState) {
            logger.log("Different state", state, roundState);
            return false;
        }
        const oldCard = cardsOnTable[playerIndex];
        if (oldCard !== undefined && !allowChangeMove) {
            logger.log("allowChangeMove not set", oldCard);
            return false;
        }
        const hand = players[playerIndex];
        if (!hand.includes(card)) {
            logger.log("foreign hand", hand, card);
            return false;
        }
        return true;
    };

    const moveInner = ({card, playerIndex}) => {
        const oldCard = cardsOnTable[playerIndex];
        const hand = players[playerIndex];
        const indexInHand = hand.indexOf(card);
        assert(indexInHand >= 0);
        if (oldCard === undefined) {
            hand.splice(indexInHand, 1);
        } else {
            hand[indexInHand] = oldCard;
        }
        cardsOnTable[playerIndex] = card;
    };

    return {check, moveInner};
}

export function roundBegin(state) {
    checkSanity(state);
    const roundState = RoundStage.BEGIN_ROUND;
    const toJson = () => {return {};};
    const isReady = () => true;
    const canMove = () => true;
    const moveInner = () => {return {};};
    const getRoundState = () => roundState;
    return {
        canMove,
        getRoundState,
        moveInner,
        isReady,
        toJson
    };
}

export function hide(state) {
    const {players, storyteller, logger} = {...state};
    checkSanity(state);
    const roundState = RoundStage.HIDE;
    const cardsOnTable = Array(players.length);
    const checker = handMoveChecker({...state, cardsOnTable, roundState});
    const canMove = (data) => {
        logger.log("hide canMove");
        if (data.playerIndex !== storyteller) {
            logger.log("Not storyteller", storyteller, data);
            return false;
        }
        if (!checker.check(data)) {
            return false;
        }
        return true;
    };
    const moveInner = checker.moveInner;

    const toJson = () => {
        return {cardsOnTable};
    };

    const getRoundState = () => roundState;
    const isReady = () => {
        return cardsOnTable[storyteller] !== undefined;
    };

    return {
        canMove,
        moveInner,
        getRoundState,
        isReady,
        toJson
    };
}

export function mimic(state) {
    const {storyteller, cardsOnTable, players} = {...state};
    checkSanity(state);
    assert(players.length === cardsOnTable.length, "mimic state bad");
    const roundState = RoundStage.MIMIC;
    const checker = handMoveChecker({...state, roundState});
    const canMove = (data) => {
        if (data.playerIndex === storyteller) {
            return false;
        }
        if (!checker.check(data)) {
            return false;
        }
        return true;
    };

    const moveInner = checker.moveInner;

    const getRoundState = () => roundState;
    const isReady = () => {
        const countMoves = cardsOnTable.reduce((acc, item) => acc + (item !== undefined), 0);
        return cardsOnTable.length === countMoves;
    };

    const toJson = () => {
        return {cardsOnTable};
    };

    return {
        canMove,
        getRoundState,
        moveInner,
        isReady,
        toJson
    };
}

export function guess(state) {
    const {players, storyteller, cardsOnTable, allowChangeMove, voteForOwn, logger} = {...state};
    checkSanity(state);
    assert(players.length === cardsOnTable.length, "guess state bad");
    const roundState = RoundStage.GUESS;
    const votesMap = Array(players.length);
    const canMove = (data) => {
        const {playerIndex, state, card} = {...data};
        if (playerIndex === storyteller) {
            logger.log("storyteller cannot guess", storyteller, data);
            return false;
        }
        if (state !== roundState) {
            logger.log("guess wrong state", storyteller, data);
            return false;
        }
        const indexInOnTable = cardsOnTable.indexOf(card);
        if (indexInOnTable < 0) {
            logger.log("guess no card", storyteller, data, cardsOnTable);
            return false;
        }
        const oldCard = votesMap[playerIndex];
        if (oldCard !== undefined && !allowChangeMove) {
            logger.log("guess allowChangeMove", storyteller, data);
            return false;
        }
        if (indexInOnTable === playerIndex && !voteForOwn) {
            logger.log("guess voteForOwn", storyteller, data);
            return false;
        }
        logger.log("guess ok", data);
        return true;
    };

    const moveInner = ({card, playerIndex}) => {
        votesMap[playerIndex] = card;
    };

    const getRoundState = () => roundState;
    const isReady = () => {
        const countMoves = votesMap.reduce((acc, item) => acc + (item !== undefined), 0);
        return countMoves + 1 >= players.length;
    };
    const toJson = () => {
        return {cardsOnTable, votesMap};
    };

    return {
        canMove,
        getRoundState,
        moveInner,
        isReady,
        toJson
    };
}

function fillPlayers(scoreDiff, storyteller, scoreReg, scoreStoryteller) {
    for (let i = 0; i < scoreDiff.length; ++i) {
        if (i === storyteller) {
            scoreDiff[i] += scoreStoryteller;
        } else {
            scoreDiff[i] += scoreReg;
        }
    }
}

export function countScore(state) {
    const {
        players, storyteller, cardsOnTable, votesMap,
        scoreAllReg, scoreAllStoryteller,
        scoreNoneReg, scoreNoneStoryteller,
        scoreAdditionReg,
        scoreAdditionStoryteller,
        scoreGuessReg, scoreGuessStoryteller
    } = {...state};
    checkSanity(state);
    assert(players.length === cardsOnTable.length, "countScore state bad");
    assert(players.length === votesMap.length, "countScore state bad2");
    const roundState = RoundStage.COUNT_SCORE;
    const scoreDiff = Array(players.length).fill(0);
    const storytellerCard = cardsOnTable[storyteller];
    const playersCount = votesMap.reduce((arr, cur) => {
        if (cur !== undefined) {
            const plIndex = cardsOnTable.indexOf(cur);
            ++arr[plIndex];
        }
        return arr;
    }, Array(players.length).fill(0));

    const storytellerCount = playersCount[storyteller];
    if (storytellerCount === players.length - 1) {
        // all
        fillPlayers(scoreDiff, storyteller, scoreAllReg, scoreAllStoryteller);
    } else if (storytellerCount === 0) {
        // none
        fillPlayers(scoreDiff, storyteller, scoreNoneReg, scoreNoneStoryteller);
    } else {
        for (let i = 0; i < scoreDiff.length; ++i) {
            if (i === storyteller) {
                scoreDiff[i] = scoreGuessStoryteller;
            } else {
                if (votesMap[i] === storytellerCard) {
                    scoreDiff[i] = scoreGuessReg;
                }
            }
        }
    }

    for (let i = 0; i < scoreDiff.length; ++i) {
        if (i === storyteller) {
            scoreDiff[i] += scoreAdditionStoryteller * playersCount[i];
        } else {
            scoreDiff[i] += scoreAdditionReg * playersCount[i];
        }
    }

    const toJson = () => {
        return {scoreDiff};
    };
    const getRoundState = () => roundState;
    const isReady = () => true;

    return {
        isReady,
        getRoundState,
        toJson
    };
}

export function applyScore(state) {
    const roundState = RoundStage.APPLY_SCORE;

    const {scoreMap, scoreDiff} = {...state};
    assert(scoreDiff.length === scoreMap.length, "Bad score");
    for (let i = 0; i < scoreMap.length; ++i) {
        scoreMap[i] += scoreDiff[i];
    }

    const toJson = () => {
        return {};
    };
    const getRoundState = () => roundState;
    const isReady = () => true;

    return {
        isReady,
        getRoundState,
        toJson
    };
}
