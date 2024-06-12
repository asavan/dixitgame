import { getWebSocketUrl, getMyId, glueNetToActions } from "../connection/common.js";
import connectionChooser from "../connection/connection_chooser.js";
import loggerFunc from "../views/logger.js";
import PromiseQueue from "../utils/async-queue.js";
import { assert } from "../utils/assert.js";
import lobbyFunc from "../core/client-lobby.js";
import initPresenter from "../rules/presenter.js";
import networkMapperObj from "../core/network_mapper.js";
import glueObj from "../core/glue.js";

import viewActions from "../rules/view_actions.js";

// function netGameStart({ document, settings, rngEngine, queue, myId }, gameToNetwork, data ) {
//     const myIndex = data.players.findIndex(p => p.externalId === myId);
//     const presenter = initPresenter({ document, settings, rngEngine, queue, myIndex }, data);
//     const vActions = viewActions(presenter);
//     const eActions = engineActions(gameToNetwork);
//     glueObj.glueSimpleByObj(presenter, eActions);
//     glueNetToActions(connection, vActions, queue);
// }


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

export default async function netMode(netModeData) {
    const { window, document, settings, rngEngine } = { ...netModeData };
    const connectionFunc = await connectionChooser(settings);

    const myId = getMyId(window, settings, rngEngine);
    assert(myId, "No net id");
    const logger = loggerFunc(20, null, settings);
    const networkLogger = loggerFunc(3, null, settings);
    const traceLogger = loggerFunc(1, null, settings);
    const connection = connectionFunc(myId, networkLogger, false);
    const socketUrl = getWebSocketUrl(settings, window.location);
    if (!socketUrl) {
        logger.error("Can't determine ws address", socketUrl);
        return;
    }

    onConnectionAnimation(document, connection, logger);
    const gameWaiter = new Promise((resolve, reject) => {
        connection.on("open", (serverData) => {
            traceLogger.log("Server id ", serverData, myId);
            const serverId = serverData.data.id;
            assert(serverId === serverData.from, serverData.from);
            const queue = PromiseQueue(logger);
            const lobby = lobbyFunc({ window, document, settings, myId });
            const gameToNetwork = networkMapperObj.networkMapperClient({logger, connection, myId, serverId});
            glueObj.glueSimple(lobby, gameToNetwork);
            traceLogger.log("After glue", lobby.actionKeys());
            const actions = {
                "start": (data) => {
                    traceLogger.log("start", data);
                    const myIndex = data.playersRaw.findIndex(p => p.externalId === myId);
                    const presenter = initPresenter({ ...netModeData, queue, myIndex }, data);
                    const vActions = viewActions(presenter);
                    glueObj.glueSimple(presenter, gameToNetwork);
                    const glued = glueNetToActions(connection, vActions, queue);
                    traceLogger.log("After glue3", glued);
                    return;
                }
            };
            glueNetToActions(connection, actions, queue);
            logger.log("After glue2");
            lobby.afterSetup();
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
