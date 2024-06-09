import {getWebSocketUrl, getMyId} from "../connection/common.js";
import connectionChooser from "../connection/connection_chooser.js";
import loggerFunc from "../views/logger.js";
import PromiseQueue from "../utils/async-queue.js";
import { assert } from "../utils/assert.js";
import lobbyFunc from "../core/client-lobby.js";

function onConnectionAnimation(document, connection, logger) {
    connection.on("socket_open", () => {
        const grid = document.querySelector(".places");
        grid.classList.add("loading");
        logger.log("socket_open");
        const onClose = () => {
            logger.log("onConnectionAnimation");
            grid.classList.remove("loading");
            grid.classList.add("flying-cards");
        };
        connection.on("socket_close", onClose);
        connection.on("open", onClose);
    });
}

function setupGameToNetwork({keys, game, connection, logger, myId, serverId}) {
    for (const handlerName of keys) {
        logger.log("setup handler", handlerName);
        game.on(handlerName, (n) => {
            if (n && n.externalId && myId !== n.externalId) {
                logger.log("Ignore", n.externalId);
                return;
            }
            return connection.sendRawTo(handlerName, n, serverId);
        });
    }
}

export default async function netMode({window, document, settings, rngEngine}) {
    const connectionFunc = await connectionChooser(settings);

    const myId = getMyId(window, settings, rngEngine);
    assert(myId, "No net id");
    const logger = loggerFunc(2, null, settings);
    const connection = connectionFunc(myId, logger, false);
    const socketUrl = getWebSocketUrl(settings, window.location);
    if (!socketUrl) {
        logger.error("Can't determine ws address", socketUrl);
        return;
    }

    onConnectionAnimation(document, connection, logger);
    const gameWaiter = new Promise((resolve, reject) => {
        connection.on("open", (serverId) => {
            logger.log("Server id ", serverId, myId);
            const queue = PromiseQueue(console);
            const lobby = lobbyFunc({window, document, settings, myId});
            setupGameToNetwork(lobby, connection, logger, myId, serverId);
            const actions = {"start": (data) => {
                logger.log("start", data);
                return;
            }};
            connection.registerHandler(actions, queue);
            lobby.onConnect();
            resolve(lobby);
        });

        connection.on("error", (e) => {
            logger.error(e);
            reject(e);
        });
    });

    await connection.connect(socketUrl);
    const lobby = await gameWaiter;
    return lobby;
}
