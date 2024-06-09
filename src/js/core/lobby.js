import enterName from "../views/names.js";
import choosePlaceFunc from "../views/places.js";
import loggerFunc from "../views/logger.js";
import {assert} from "../utils/assert.js";
import handlersFunc from "../utils/handlers.js";

function makeCommonSeed(players) {
    let seed = "";
    for (const pl of players) {
        seed += pl.externalId;
    }
    return seed;
}

export default function lobby({window, document, settings, myId, players}) {

    const logger = loggerFunc(8, null, settings);
    const traceLogger = loggerFunc(2, null, settings);

    assert(myId, "No id");

    const commands = [
        "username",
        "start"
    ];

    const handlers = handlersFunc(commands);
    function on(name, f) {
        return handlers.on(name, f);
    }

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

    function banPlayer(id1) {
        logger.log("banPlayer " + id1);
        players[id1].banned = true;
    }

    const renderChoosePlace = () => choosePlaceFunc(document, {
        onSeatsFinished: afterAllJoined,
        onSwap: swap,
        onClick
    }, players);

    function join(name, externalId, isBot) {
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
        traceLogger.log("change name");
        return handlers.call("username", {name, externalId: myId});
    };

    const onConnect = () => {
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

    const toJson = () => {
        return {players: filterPlayers(), seed: settings.seed};
    };

    async function afterAllJoined() {
        assert(players.length > 0, "No players");
        if (!settings.seed) {
            logger.log("settings", settings);
            settings.seed = makeCommonSeed(players);
        } else {
            logger.log("settings already set", settings);
        }
        traceLogger.log("Game init");
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
        join,
        canSeeGame,
        toJson,
        onConnect,
        afterAllJoined,
        disconnect,
    };
}
