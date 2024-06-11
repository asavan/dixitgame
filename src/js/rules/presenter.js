import newPlayer from "../core/player.js";
import core from "../core/basic.js";
import layout from "../views/layout.js";

// TODO delete mb?
import loggerFunc from "../views/logger.js";

import handlersFunc from "../utils/handlers.js";
import RoundStage from "./constants.js";

export default function initPresenter({document, settings, myIndex},
    playersRaw,
    {
        dealer,
        direction,
        maxScore,
        gameState
    }
) {

    const logger = loggerFunc(60, null, settings);
    const players = playersRaw.map((p, i) => newPlayer([], i, 0, p.name));
    let stage = RoundStage.HIDE;

    const commands = ["tryMove"];

    const handlers = handlersFunc(commands);
    function on(name, f) {
        return handlers.on(name, f);
    }

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

    const showAllCards = () => {
        // maybe show cards on round end and on game end
        return gameState === core.GameStage.CHOOSE_DEALER;
    };

    const onChoose = (card) => {
        logger.log("YEY card", card);
        handlers.call("tryMove", {playerIndex: myIndex, card, stage});
    };

    const onMove = (data) => {
        logger.log("On Move", data);
        layout.drawLayout({document, myIndex, settings, players, dealer, logger, onChoose});
    };

    const onChangeState = (data) => {
        logger.log("On onChangeState", data);
        stage = data.stage;
        layout.drawLayout({document, myIndex, settings, players, dealer, logger, onChoose});
    };

    const onDeal = (data) => {
        logger.log("On onDeal", data);
        const {playerIndex, card} = {...data};
        players[playerIndex].addCard(card);
        layout.drawLayout({document, myIndex, settings, players, dealer, logger, onChoose});
    };

    const onShuffle = (data) => {
        logger.log("onShuffle", data);
    };

    layout.drawLayout({document, myIndex, settings, players, dealer, logger, onChoose});
    logger.log("Game init");


    const actionKeys = () => handlers.actionKeys();

    return {
        on,
        actionKeys,
        state,
        onMove,
        onChangeState,
        onDeal,
        onShuffle,
        getPlayerByIndex,
        size,
        getDealer,
        showAllCards,
    };
}
