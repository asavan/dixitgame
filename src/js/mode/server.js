import loggerFunc from "../views/logger.js";
import { getWebSocketUrl, getMyId } from "../connection/common.js";
import connectionChooser from "../connection/connection_chooser.js";
import PromiseQueue from "../utils/async-queue.js";
import { makeQr, removeElem } from "../views/qr_helper.js";
import { assert } from "../utils/assert.js";
import lobbyFunc from "../core/lobby.js";
import glueObj from "../core/glue.js";
import networkAdapter from "../connection/network_adapter.js";
import startServerWithUI from "./common.js";
import addSettingsButton from "../views/settings-form-btn.js";

export default async function server({window, document, settings, rngEngine}) {
    const myId = getMyId(window, settings, rngEngine);
    const logger = loggerFunc(6, null, settings);
    const networkLogger = loggerFunc(3, null, settings);
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

    const onJoin = (data) => {
        logger.log("User joined", data);
        const { name, externalId } = data;
        assert(name, "No name");
        assert(externalId, "No externalId");
        return lobby.join(name, externalId, settings.playerIsBot);
    };

    // first phase
    const actions = {
        "username": onJoin
    };

    const onNameEntered = (data) => {
        addSettingsButton(document, settings);
        onJoin(data);
    };
    lobby.on("username", onNameEntered);

    const nAdapter = networkAdapter(connection, queue, myId, myId, networkLogger);
    nAdapter.connectMapper(glueObj.simpleMapper(actions));

    lobby.on("start", async (data) => {
        removeElem(qrCodeEl);
        qrCodeEl = undefined;
        const {players} = {...data};
        const starter = startServerWithUI({window, document, settings, rngEngine}, myId, players);
        const gameCore = starter.getCore();
        const eAdapter = starter.getCoreAdapter();
        presenter = starter.getPresenterAdapter().getCore();
        eAdapter.connectAdapter(nAdapter);

        await gameCore.start(presenter.toJson());
    });

    connection.on("disconnect", (id) => {
        const is_disconnected = lobby.disconnect(id);
        logger.log("disconnect", {id, is_disconnected});
    });

    connection.on("open", (con) => {
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
