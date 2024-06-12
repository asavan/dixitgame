import loggerFunc from "../views/logger.js";
import { getWebSocketUrl, getMyId, glueNetToActions } from "../connection/common.js";
import connectionChooser from "../connection/connection_chooser.js";
import PromiseQueue from "../utils/async-queue.js";
import { makeQr, removeElem } from "../views/qr_helper.js";
import { assert } from "../utils/assert.js";
import lobbyFunc from "../core/lobby.js";
import initPresenter from "../rules/presenter.js";
import emptyEngine from "../rules/default-engine.js";
import dixit from "../rules/dixit.js";
import viewActions from "../rules/view_actions.js";
import engineActions from "../rules/engine_actions.js";
import glueObj from "../core/glue.js";
import networkMapperObj from "../core/network_mapper.js";
import { delay } from "../utils/timer.js";


export default async function server({window, document, settings, rngEngine}) {
    const clients = {};
    let index = 0;
    const myId = getMyId(window, settings, rngEngine);
    const logger = loggerFunc(70, null, settings);
    const networkLogger = loggerFunc(3, null, settings);
    clients[myId] = {index};
    const socketUrl = getWebSocketUrl(settings, window.location);
    if (!socketUrl) {
        logger.error("Can't determine ws address", socketUrl);
        return;
    }

    const connectionFunc = await connectionChooser(settings);
    const connection = connectionFunc(myId, networkLogger, true);
    connection.on("error", (e) => {
        logger.error(e);
        throw e;
    });

    let qrCodeEl;
    let presenter;

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

    lobby.on("username", actions["username"]);

    const gameToNetwork = networkMapperObj.networkMapperServer({logger, connection});
    // TODO
    // glueObj.glueSimpleByObj(lobby, nMapper);
    glueNetToActions(connection, actions, queue);

    lobby.on("start", async (data) => {
        removeElem(qrCodeEl);
        qrCodeEl = undefined;
        const myIndex = data.players.findIndex(p => p.externalId === myId);
        const loggerCore = loggerFunc(7, null, settings);
        presenter = initPresenter({document, settings, rngEngine, queue, myIndex},
            emptyEngine(settings, data.players));
        const gameCore = dixit.game({settings, rngEngine, delay,
            logger: loggerCore, playersCount: data.players.length});
        const vActions = viewActions(presenter);
        const eActions = engineActions(gameCore);
        glueObj.glueSimpleByObj(gameCore, vActions);
        glueObj.glueSimpleByObj(presenter, eActions);
        glueObj.glueSimpleByObj(gameCore, gameToNetwork);
        glueNetToActions(connection, eActions, queue);
        await gameCore.start(presenter.toJson());
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
        clients[con.id] = {index};
        logger.log("connected", con);
        if (lobby.canSeeGame(con.id) && presenter) {
            return connection.sendRawTo("start", presenter.toJson(), con.id);
        } else {
            logger.log("Try see game", con.id);
        }
    });

    lobby.afterSetup();
    await connection.connect(socketUrl);
}
