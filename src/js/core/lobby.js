import enterName from "../views/names.js";
import choosePlaceFunc from "../views/places.js";

import {
    assert, handlersFunc,
    loggerFunc
} from "netutils";

export default function lobby({window, document, settings, myId, players}) {

    const logger = loggerFunc(document, settings, 3);

    assert(myId, "No id");

    const commands = [
        "username",
        "start"
    ];

    const handlers = handlersFunc(commands);
    const {actionKeys, on} = handlers;

    ///
    let clickCount = 0;
    const maxClickToBan = settings.maxClickToBan;
    let lastTryToKick = -1;

    const onClick = (id) => {
        if (lastTryToKick === id) {
            ++clickCount;
        } else {
            lastTryToKick = id;
            clickCount = 1;
        }
        if (clickCount >= maxClickToBan) {
            banPlayer(lastTryToKick);
        }
    };

    function banPlayer(playerIndex) {
        logger.log("banPlayer " + playerIndex);
        players[playerIndex].banned = true;
    }

    const renderChoosePlace = () => choosePlaceFunc(document, {
        onSeatsFinished: afterAllJoined,
        onSwap: swap,
        onClick
    }, players);

    function join(name, externalId, isBot) {
        logger.log("join");
        assert(name, "No name");
        assert(externalId, "No externalId");
        const found = players.findIndex(player => player.externalId === externalId);

        if (found === -1) {
            players.push({name, externalId, is_bot: !!isBot});
        } else {
            players[found].name = name;
            players[found].disconnected = false;
        }
        renderChoosePlace();
        return true;
    }

    const disconnect = (externalId) => {
        let result = false;
        logger.log("disconnect", externalId);
        const found = players.findIndex(player => player.externalId === externalId);
        if (found >= 0) {
            players[found].disconnected = true;
            result = true;
        }
        renderChoosePlace();
        return result;
    };

    const onNameChange = (name) => {
        logger.log("change name");
        return handlers.call("username", {name, externalId: myId});
    };

    const afterSetup = () => {
        logger.log("afterSetup");
        return enterName(window, document, settings, onNameChange);
    };

    function swap(id1, id2) {
        const temp = players[id1];
        players[id1] = players[id2];
        players[id2] = temp;
        return renderChoosePlace();
    }

    function filterPlayers() {
        return players.filter(p => !p.banned && p.name && !p.disconnected);
    }

    const toJson = () => ({players: filterPlayers(), seed: settings.seed});

    async function afterAllJoined() {
        assert(players.length > 0, "No players");
        logger.log("Game init", settings);
        await handlers.call("start", toJson());
    }

    const hasExternalPlayer = (externalId) => {
        const pl = players.find(p => p.externalId === externalId);
        if (pl === undefined) {
            return false;
        }
        return !pl.banned;
    };

    const canSeeGame = (externalId) => hasExternalPlayer(externalId);

    return {
        on,
        actionKeys,
        afterSetup,
        join,
        canSeeGame,
        toJson,
        afterAllJoined,
        disconnect,
    };
}
