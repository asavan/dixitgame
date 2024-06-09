import newPlayer from "../core/player.js";
import core from "../core/basic.js";
import layout from "../views/layout.js";

// TODO delete mb?
import loggerFunc from "../views/logger.js";

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
    const players = playersRaw.map((p, i) => newPlayer([12, 34, 4, 5, 7, 77], i, 0, p.name));

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

    layout.drawLayout({document, myIndex, settings, players, dealer, logger});
    logger.log("Game init");

    return {
        state,
        getPlayerByIndex,
        size,
        getDealer,
        showAllCards,
    };
}
