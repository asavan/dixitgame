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

import reveal from "../views/reveal.js";
import {delay} from "../utils/timer.js";

export default function initPresenter({ document, settings, rngEngine, myIndex, queue },
    {
        dealer,
        direction,
        maxScore,
        gameState,
        cardsOnTable,
        votesMap,
        playersRaw,
        stage,
        urlGenRaw
    }
) {

    const logger = loggerFunc(6, null, settings);
    const traceLogger = loggerFunc(1, null, settings);
    const players = playersRaw.map((p, i) => newPlayer(p.pile, i, p.score, p.name, p.externalId));
    const urlGen = urlGenerator().makeUrlGen(urlGenRaw);

    const commands = ["tryMove"];

    const handlers = handlersFunc(commands, queue);
    let currentPlayer = myIndex;

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
            urlGenRaw,
            playersRaw: players.map(p => p.toJson())
        };
    }

    const onChoose = ({ card, plNum }) => {
        let playerIndex = plNum;
        if (stage === RoundStage.GUESS) {
            playerIndex = currentPlayer;
        }
        traceLogger.log("onChoose", card, plNum, playerIndex, currentPlayer);
        handlers.call("tryMove", { playerIndex, card, state: stage });
    };

    const onMove = (data) => {
        traceLogger.log("On Move", data);
        const { playerIndex, state, card } = { ...data };
        if (state === RoundStage.HIDE || state === RoundStage.MIMIC) {
            players[playerIndex].removeCard(card);
            // cardsOnTable.push(card);
        }

        if (stage === RoundStage.GUESS) {
            if (["ai", "hotseat"].includes(settings.mode)) {
                currentPlayer = core.nextPlayer(0, size(), settings.direction, currentPlayer);
                drawGuess();
            }
            traceLogger.log(data);
            layout.drawGuessesFull(document, data.votesMap, myIndex);
            if (myIndex === dealer) {
                reveal.colorizeDealerCard(dealer, cardsOnTable, document);
                reveal.showVote(data.votesMap, document, players);
            }
            return;
        }

        drawScreen("drawMove");
    };

    const drawGuess = () => {
        const cardsToShow = [...cardsOnTable];
        shuffleArray(cardsToShow, rngEngine);
        let myCard;
        if (currentPlayer !== dealer) {
            myCard = cardsOnTable[currentPlayer];
        }
        logger.log("drawGuess", myCard, currentPlayer, cardsToShow);
        layout.drawOpenPile(document, cardsToShow, urlGen, myCard);
    };

    const onChangeState = async (data) => {
        logger.log("On onChangeState", data, players);
        stage = data.stage;
        if (["ai", "hotseat"].includes(settings.mode)) {
            currentPlayer = core.nextPlayer(0, size(), settings.direction, dealer);
        }
        if (stage === RoundStage.GUESS) {
            cardsOnTable = data.cardsOnTable;
            drawGuess();
            layout.drawGuessesFull(document, data.votesMap, myIndex);
            return;
        }

        if (stage === RoundStage.COUNT_SCORE) {
            reveal.colorizeDealerCard(dealer, cardsOnTable, document);
            reveal.showVote(data.votesMap, document, players);
            await delay(1000);
            await layout.drawScoreAll(document, data.scoreDiff);
            await delay(6000);
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
        const { playerIndex, card } = { ...data };
        players[playerIndex].addCard(card);
        drawScreen("onDeal");
    };

    function onGameOver(data) {
        stage = RoundStage.ROUND_OVER;
        drawScreen("onGameOver");
        const { winners } = { ...data };
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
        traceLogger.log("drawScreen", marker);

        layout.drawLayout({ document, myIndex, settings, players, dealer, urlGen, logger: traceLogger, onChoose });
        if (stage === RoundStage.GUESS) {
            drawGuess();
            return;
        }
    }

    drawScreen("Game init");
    traceLogger.log("Game init", myIndex);

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
        onGameOver,
        onRoundEnd
    };
}
