import newPlayer from "../core/player.js";
import core from "../core/basic.js";
import layout from "../views/layout.js";

export default function initPresenter({document, settings, myIndex},
    playersRaw,
    {
        dealer,
        direction,
        maxScore,
        gameState
    }
) {

    const players = playersRaw.map((p, i) => newPlayer([12, 34], i, 0, "bot"+i));

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

    layout.drawLayout({document, myIndex, settings, players, dealer});


    return {
        state,
        getPlayerByIndex,
        size,
        getDealer,
        showAllCards,
    };
}
