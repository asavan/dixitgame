import loggerFunc from "../views/logger.js";
import { getWebSocketUrl, getMyId } from "../connection/common.js";
import connectionChooser from "../connection/connection_chooser.js";
import PromiseQueue from "../utils/async-queue.js";
import { makeQr, removeElem } from "../views/qr_helper.js";
import { assert } from "../utils/assert.js";
import lobbyFunc from "../core/lobby.js";
import initPresenter from "../rules/presenter.js";
import emptyEngine from "../core/default-engine.js";

function setupGameToNetwork(keys, game, connection, logger) {
    for (const handlerName of keys) {
        logger.log("setup handler " + handlerName);
        game.on(handlerName, (n) => {
            let ignore;
            if (n && n.externalId) {
                console.log("Ignore", n.externalId);
                ignore = [n.externalId];
            }
            return connection.sendRawAll(handlerName, n, ignore);
        });
    }
}

export default async function server({window, document, settings, rngEngine}) {
    const clients = {};
    let index = 0;
    const myId = getMyId(window, settings, rngEngine);
    const logger = loggerFunc(70, null, settings);
    clients[myId] = {index};
    const socketUrl = getWebSocketUrl(settings, window.location);
    if (!socketUrl) {
        logger.error("Can't determine ws address", socketUrl);
        return;
    }

    const connectionFunc = await connectionChooser(settings);
    const connection = connectionFunc(myId, logger, true);
    connection.on("error", (e) => {
        logger.error(e);
        throw e;
    });

    let qrCodeEl;

    connection.on("socket_open", () => {
        qrCodeEl = makeQr(window, document, settings);
        connection.on("socket_close", () => {
            removeElem(qrCodeEl);
            qrCodeEl = undefined;
        });
    });

    const queue = PromiseQueue(logger);
    const lobby = lobbyFunc({window, document, settings, myId, players: []});

    // first phase
    const actions = {
        "username": (data) => {
            logger.log("User joined", data);
            const { name, externalId } = data;
            assert(name, "No name");
            assert(externalId, "No externalId");
            const client = clients[externalId];
            client.username = name;
            return lobby.join(name, externalId, settings.playerIsBot);
        }
    };

    lobby.on("username", async (data) => {
        await actions["username"](data);
    });

    connection.registerHandler(actions, queue);

    lobby.on("start", (data) => {
        removeElem(qrCodeEl);
        qrCodeEl = undefined;
        const myIndex = data.players.findIndex(p => p.externalId === myId);
        const presenter = initPresenter({document, settings, rngEngine, queue, myIndex},
            data.players, emptyEngine(settings));
        const loggerActions = loggerFunc(7, null, settings);
        loggerActions.log(presenter.state());
        setupGameToNetwork(["start"], lobby, connection, logger);

        // connection.registerHandler(unoActions, queue);
    });

    connection.on("disconnect", (id) => {
        const is_disconnected = lobby.disconnect(id);
        if (is_disconnected) {
            --index;
            delete clients[id];
        }
        logger.log({id, index}, "disconnect");
    });

    connection.on("open", (con) => {
        ++index;
        clients[con.id] = {"index": index};
        logger.log("connected", con);
        if (lobby.canSeeGame(con.id)) {
            return connection.sendRawTo("start", lobby.toJson(), con.id);
        } else {
            logger.log("Try see game", con.id);
        }
    });

    lobby.onConnect();
    await connection.connect(socketUrl);
}
