import lobbyFunc from "../core/lobby.js";
import glueObj from "../core/glue.js";
import networkAdapter from "../connection/network_adapter.js";
import startServerWithUI from "./common.js";
import addSettingsButton from "../views/settings-form-btn.js";

import {
    assert, createSignalingChannel,
    broadcastConnectionFunc, loggerFunc, makeQrStr,
    netObj, removeElem, delay, PromiseQueue
} from "netutils";

function makeQr(window, document, settings, serverId) {
    const staticHost = netObj.getHostUrl(settings, window.location);
    const url = new URL(staticHost);
    if (serverId) {
        url.searchParams.set("serverId", serverId);
    }
    console.log("enemy url", url.toString());
    const image = {
        source: "./images/drixit_icon.svg",
        width: "10%",
        height: "20%",
        x: "center",
        y: "center",
    };
    return makeQrStr(url.toString(), window, document, settings, image);
}


export default async function server({window, document, settings, rngEngine}) {
    const myId = netObj.getMyId(window, settings, Math.random);
    settings.serverId = myId;
    const networkLogger = loggerFunc(document, settings);

    const gameChannel = await createSignalingChannel(myId, myId, window.location, settings, networkLogger);
    if (!gameChannel) {
        networkLogger.error("No chan");
        return;
    }
    let qrCodeEl = makeQr(window, document, settings, myId);

    const connection = broadcastConnectionFunc(myId, networkLogger, gameChannel);

    const logger = loggerFunc(document, settings, 6);
    connection.on("error", (e) => {
        logger.error(e);
        throw e;
    });

    let presenter;

    const queue = PromiseQueue(logger);
    const lobby = lobbyFunc({window, document, settings, myId, players: []});

    const onJoin = (data) => {
        logger.log("User joined", data);
        const {name, externalId} = data;
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

    connection.on("join", async (json) => {
        logger.log("connected", json);
        const clientId = json.from;
        connection.sendRawTo("gameinit", {id: myId}, clientId);
        if (lobby.canSeeGame(clientId) && presenter) {
            await delay(200);
            return connection.sendRawTo("start", presenter.toJson(), clientId);
        } else {
            logger.log("Try see game", clientId);
        }
    });

    lobby.afterSetup();
    await connection.connect();
}
