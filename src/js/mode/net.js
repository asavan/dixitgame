import { getWebSocketUrl, getMyId } from "../connection/common.js";
import connectionChooser from "../connection/connection_chooser.js";
import loggerFunc from "../views/logger.js";
import PromiseQueue from "../utils/async-queue.js";
import { assert } from "../utils/assert.js";
import lobbyFunc from "../core/client-lobby.js";
import initPresenter from "../rules/presenter.js";
import networkAdapter from "../connection/network_adapter.js";
import glueObj from "../core/glue.js";

import viewActions from "../rules/view_actions.js";
import urlGenerator from "../views/get_image_url.js";
import { delay } from "../utils/timer.js";
import addSettingsButton from "../views/settings-form-btn.js";


function flyingCards(box) {
    const urlGen = urlGenerator();
    const loop = async () => {
        if (!box.classList.contains("flying-cards")) {
            console.log(box.classList);
            return;
        }
        const nextCardArr = urlGen.makeKUrlGen(1, Math.random);
        const nextCard = nextCardArr.getUrl(0);
        const url = `url(${nextCard})`;
        const imagePreload = new Image();
        imagePreload.onload = ()=> {
            box.style.setProperty("--background-url", url);
        };
        imagePreload.src = nextCard;
        await delay(2000);
        await loop();
    };
    return loop();
}

function onConnectionAnimation(document, connection, logger) {
    connection.on("socket_open", () => {
        const grid = document.querySelector(".places");
        grid.replaceChildren();
        grid.classList.add("loading");
        logger.log("socket_open");
        const onClose = () => {
            logger.log("onConnectionAnimation");
            grid.classList.remove("loading");
            grid.classList.add("flying-cards");
            flyingCards(grid);
        };
        connection.on("socket_close", onClose);
        connection.on("open", onClose);
    });
}

function onConnectionOpen(connection, serverData, netModeData, myId, logger, settings) {
    const serverId = serverData.data.id;
    assert(serverId === serverData.from, serverData.from);
    const queue = PromiseQueue(logger);
    const lobby = lobbyFunc({ ...netModeData, myId });
    const nAdapter = networkAdapter(connection, queue, myId, serverId, logger);
    const actions = {
        "start": (data) => {
            logger.log("start", data);
            const myIndex = data.playersRaw.findIndex(p => p.externalId === myId);
            const presenter = initPresenter({ ...netModeData, queue, myIndex }, data);
            const pAdapter = glueObj.wrapAdapter(presenter, viewActions);
            pAdapter.connectAdapter(nAdapter);
        }
    };

    lobby.on("username", () => {
        addSettingsButton(document, settings);
    });

    const lAdapter = glueObj.wrapAdapterActions(lobby, actions);
    lAdapter.connectAdapter(nAdapter);
    lobby.afterSetup();
    return lobby;
}

export default async function netMode(netModeData) {
    const { window, document, settings, rngEngine } = { ...netModeData };
    const connectionFunc = await connectionChooser(settings);

    const myId = getMyId(window, settings, rngEngine);
    assert(myId, "No net id");
    const logger = loggerFunc(5, null, settings);
    const socketUrl = getWebSocketUrl(settings, window.location);
    if (!socketUrl) {
        logger.error("Can't determine ws address", socketUrl);
        return;
    }

    const networkLogger = loggerFunc(3, null, settings);
    const connection = connectionFunc(myId, networkLogger, false);
    onConnectionAnimation(document, connection, logger);
    const lobbyWaiter = new Promise((resolve, reject) => {
        const traceLogger = loggerFunc(1, null, settings);
        connection.on("open", (serverData) => {
            traceLogger.log("Server id ", serverData, myId);
            const lobby = onConnectionOpen(connection, serverData, netModeData, myId, logger, settings);
            resolve(lobby);
        });
        connection.on("error", (e) => {
            traceLogger.error(e);
            reject(e);
        });
    });

    await connection.connect(socketUrl);
    connection.sendRawAll("join", {id: myId});
    const lobby = await lobbyWaiter;
    return lobby;
}
