import deckFunc from "../core/deck.js";
import newPlayer from "../core/player.js";
import core from "../core/basic.js";

import handlersFunc from "../utils/handlers.js";
import { assert } from "../utils/assert.js";
import loggerFunc from "../views/logger.js";

// import dixit from "./dixit.js";


export default function game(data) {
    const {playersRaw, dealer, direction, rngEngine, settings} = {...data};
    let {gameState} = {...data};

    const logger = loggerFunc(70, null, settings);

    const commands = [
        "shuffle",
        "deal",
        "move"
    ];

    const handlers = handlersFunc(commands);
    function on(name, f) {
        return handlers.on(name, f);
    }

    function report(callbackName, data) {
        return handlers.call(callbackName, data);
    }

    const onShuffle = (d) => report("shuffle", d);
    const players = playersRaw.map((p, ind) => newPlayer(p.pile, ind, p.score));
    const deck = deckFunc.newShuffledDeck(onShuffle, rngEngine, settings.cardsCount);


    async function dealN(initialDealt) {
        assert(initialDealt*players.length < deck.size(), "Not enought cards to play");
        for (let round = 0; round < initialDealt; ++round) {
            const n = players.length;
            for (let i = 0; i < n; i++) {
                const dealIndex = core.nextPlayer(i, n, direction, dealer);
                const currentPlayer = players[dealIndex].getIndex();
                await dealToPlayer(deck, currentPlayer);
            }
        }
        gameState = core.GameStage.ROUND;
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
        players[playerIndex].addCard(card);
        await report("deal", {playerIndex, card});
        return card;
    }

    const toJson = () => {
        return {gameState};
    };



    return {
        dealN,
        toJson,
        on
    };
}
