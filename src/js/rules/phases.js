import {assert} from "../utils/assert.js";
import {RoundStage} from "./constants.js";


function checkSanity(state) {
    const {players, storyteller} = {...state};
    assert(players.length > 0);
    assert(storyteller >= 0 && storyteller < players.length);
}

function handMoveChecker({players, cardsOnTable, allowChangeMove, roundState}) {
    const check = ({playerIndex, state, card}) => {
        if (state !== roundState) {
            return false;
        }
        const oldCard = cardsOnTable[playerIndex];
        if (oldCard !== undefined && !allowChangeMove) {
            return false;
        }
        const hand = players[playerIndex];
        if (!hand.includes(card)) {
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

export function hide(state) {
    const {players, storyteller, allowChangeMove} = {...state};
    checkSanity(state);
    const roundState = RoundStage.HIDE;
    const cardsOnTable = Array(players.length);
    const checker = handMoveChecker({players, cardsOnTable, allowChangeMove, roundState});
    const canMove = (data) => {
        if (data.playerIndex !== storyteller) {
            return false;
        }
        if (checker.check(data)) {
            return false;
        }
        return true;
    };
    const moveInner = checker.moveInner;
    const nextAction = (act) => {
        return act({players, storyteller, cardsOnTable, allowChangeMove});
    };

    const toJson = () => {
        return {players, storyteller, cardsOnTable, allowChangeMove};
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
        toJson,
        nextAction
    };
}

export function mimic(state) {
    const {players, storyteller, cardsOnTable, allowChangeMove} = {...state};
    checkSanity(state);
    const roundState = RoundStage.MIMIC;
    const checker = handMoveChecker({players, cardsOnTable, allowChangeMove, roundState});
    const canMove = (data) => {
        if (data.playerIndex === storyteller) {
            return false;
        }
        if (checker.check(data)) {
            return false;
        }
        return true;
    };

    const moveInner = checker.moveInner;
    const nextAction = (act) => {
        return act({players, storyteller, cardsOnTable, allowChangeMove});
    };

    const getRoundState = () => roundState;
    const isReady = () => {
        return cardsOnTable.every(c => c !== undefined);
    };

    const toJson = () => {
        return {players, storyteller, cardsOnTable, allowChangeMove};
    };

    return {
        canMove,
        getRoundState,
        moveInner,
        isReady,
        nextAction,
        toJson
    };
}

export function guess(state) {
    const {players, storyteller, cardsOnTable, allowChangeMove, voteForOwn} = {...state};
    checkSanity(state);
    const roundState = RoundStage.GUESS;
    const votesMap = Array(players.length);
    const canMove = (data) => {
        const {playerIndex, state, card} = {...data};
        if (playerIndex === storyteller) {
            return false;
        }
        if (state !== roundState) {
            return false;
        }
        const indexInOnTable = cardsOnTable.indexOf(card);
        if (indexInOnTable < 0) {
            return false;
        }
        const oldCard = votesMap[playerIndex];
        if (oldCard !== undefined && !allowChangeMove) {
            return false;
        }
        if (indexInOnTable === playerIndex && !voteForOwn) {
            return false;
        }
        return true;
    };

    const moveInner = ({card, playerIndex}) => {
        votesMap[playerIndex] = card;
    };

    const getRoundState = () => roundState;
    const isReady = () => {
        return votesMap.filter(c => c === undefined).length === 1;
    };
    const toJson = () => {
        return {players, storyteller, cardsOnTable, votesMap};
    };

    return {
        canMove,
        getRoundState,
        moveInner,
        isReady,
        toJson
    };
}
