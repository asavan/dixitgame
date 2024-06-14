import newPlayer from "../core/player.js";
import core from "../core/basic.js";
import layout from "../views/layout.js";

// TODO delete mb?
import loggerFunc from "../views/logger.js";

import handlersFunc from "../utils/handlers.js";
import RoundStage from "./constants.js";

import { shuffleArray } from "../utils/shuffle.js";

import onGameEnd from "../views/end_game.js";

import { assert } from "../utils/assert.js";

import urlGenerator from "../views/get_image_url.js";

export default function initPresenter({document, settings, rngEngine, myIndex, queue},
    {
        dealer,
        direction,
        maxScore,
        gameState,
        cardsOnTable,
        votesMap,
        playersRaw,
        stage,
    }
) {

    const logger = loggerFunc(6, null, settings);
    const traceLogger = loggerFunc(1, null, settings);
    const players = playersRaw.map((p, i) => newPlayer(p.pile, i, p.score, p.name, p.externalId));
    const urlGen = urlGenerator().makeKUrlGen(settings.cardsCount, rngEngine);

    const commands = ["tryMove"];

    const handlers = handlersFunc(commands, queue);

    function size() {
        return players.length;
    }

    function getDealer() {
        return dealer;
    }

    function getPlayerByIndex(ind) {
        return players[ind];
    }

    function state() {
        return {
            dealer,
            direction,
            gameState,
            maxScore
        };
    }

    function toJson() {
        return {
            dealer,
            direction,
            gameState,
            maxScore,
            cardsOnTable,
            votesMap,
            stage,
            playersRaw: players.map(p => p.toJson())
        };
    }

    const showAllCards = () => {
        // maybe show cards on round end and on game end
        return gameState === core.GameStage.CHOOSE_DEALER;
    };

    const onChoose = (card) => {
        traceLogger.log("onChoose", card);
        handlers.call("tryMove", {playerIndex: myIndex, card, state: stage});
    };

    const onMove = (data) => {
        traceLogger.log("On Move", data);
        const {playerIndex, state, card} = {...data};
        if (state === RoundStage.HIDE || state === RoundStage.MIMIC) {
            players[playerIndex].removeCard(card);
            // cardsOnTable.push(card);
        }

        if (stage === RoundStage.GUESS) {
            return;
        }

        drawScreen("drawMove");
    };

    const drawGuess = () => {
        const cardsToShow = [...cardsOnTable];
        shuffleArray(cardsToShow, rngEngine);
        let myCard;
        if (myIndex !== dealer) {
            myCard = cardsOnTable[myIndex];
        }
        logger.log("drawGuess", myCard, myIndex, cardsToShow);
        layout.drawOpenPile(document, cardsToShow, urlGen, myCard);
    };

    const onChangeState = (data) => {
        logger.log("On onChangeState", data, players);
        stage = data.stage;
        if (stage === RoundStage.GUESS) {
            cardsOnTable = data.cardsOnTable;
            drawGuess();
            return;
        }
        if (stage === RoundStage.APPLY_SCORE) {
            const scoreDiff = data.scoreDiff;
            assert(scoreDiff.length === players.length, "Bad onChangeState");
            for (let i = 0; i < players.length; ++i) {
                players[i].updateScore(scoreDiff[i]);
            }
        }
        if (stage === RoundStage.ROUND_OVER) {
            const scoreMap = data.scoreMap;
            for (let i = 0; i < players.length; ++i) {
                assert(players[i].getScore() === scoreMap[i], "Different score");
            }
        }
        drawScreen("drawOnChangeState");
    };

    const onNewRound = (data) => {
        logger.log("onNewRound", data);
        cardsOnTable = [];
        dealer = data.storyteller;
    };

    const onRoundEnd = (data) => {
        logger.log("onRoundEnd", data);
        cardsOnTable = [];
    };

    const onDeal = (data) => {
        traceLogger.log("On onDeal", data);
        const {playerIndex, card} = {...data};
        players[playerIndex].addCard(card);
        drawScreen("onDeal");
    };

    function onGameOver(data) {
        drawScreen("onGameOver");
        const {winners} = {...data};
        const names = winners.map(w => players[w].getName());
        const firstLine = names.join(", ") + " wins";
        const secondLine = "with score " + data.score;
        logger.log(firstLine, secondLine);
        onGameEnd(document, firstLine, secondLine);
        return true;
    }

    const onShuffle = (data) => {
        logger.log("onShuffle", data);
    };

    function drawScreen(marker) {
        logger.log("drawScreen", marker);

        layout.drawLayout({document, myIndex, settings, players, dealer, urlGen, logger: traceLogger, onChoose});
        if (stage === RoundStage.GUESS) {
            drawGuess();
            return;
        }
    }

    drawScreen("Game init");
    logger.log("Game init", myIndex);

    const actionKeys = handlers.actionKeys;
    const on = handlers.on;

    return {
        on,
        actionKeys,
        state,
        toJson,
        onMove,
        onChangeState,
        onNewRound,
        onDeal,
        onShuffle,
        getPlayerByIndex,
        size,
        getDealer,
        showAllCards,
        onGameOver,
        onRoundEnd
    };
}
