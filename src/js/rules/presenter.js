import newPlayer from "../core/player.js";
import core from "../core/basic.js";
import layout from "../views/layout.js";

// TODO delete mb?
import loggerFunc from "../views/logger.js";

import handlersFunc from "../utils/handlers.js";
import RoundStage from "./constants.js";

export default function initPresenter({document, settings, myIndex, queue},
    {
        dealer,
        direction,
        maxScore,
        gameState,
        cardsOnTable,
        playersRaw,
    }
) {

    const logger = loggerFunc(60, null, settings);
    const traceLogger = loggerFunc(1, null, settings);
    const players = playersRaw.map((p, i) => newPlayer(p.pile, i, p.score, p.name, p.externalId));
    let stage = RoundStage.HIDE;

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
            cardsOnTable.push(card);
        }
        layout.drawLayout({document, myIndex, settings, players, dealer, logger, onChoose});
    };

    const onChangeState = (data) => {
        logger.log("On onChangeState", data, players);
        stage = data.stage;
        layout.drawLayout({document, myIndex, settings, players, dealer, logger, onChoose});
    };

    const onNewRound = (data) => {
        logger.log("onNewRound", data);
        cardsOnTable = [];
    };

    const onDeal = (data) => {
        traceLogger.log("On onDeal", data);
        const {playerIndex, card} = {...data};
        players[playerIndex].addCard(card);
        layout.drawLayout({document, myIndex, settings, players, dealer, logger: traceLogger, onChoose});
    };

    const onShuffle = (data) => {
        logger.log("onShuffle", data);
    };

    layout.drawLayout({document, myIndex, settings, players, dealer, logger: traceLogger, onChoose});
    logger.log("Game init");


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
    };
}
