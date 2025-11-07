import initPresenter from "../rules/presenter.js";
import networkAdapter from "../connection/network_adapter.js";
import glueObj from "../core/glue.js";

import viewActions from "../rules/view_actions.js";
import urlGenerator from "../views/get_image_url.js";
import addSettingsButton from "../views/settings-form-btn.js";
import enterName from "../views/names.js";

import {
    assert, delay, broadcastConnectionFunc, createSignalingChannel,
    loggerFunc, netObj, PromiseQueue, actionToHandler
} from "netutils";


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
        imagePreload.onload = () => {
            box.style.setProperty("--background-url", url);
        };
        imagePreload.src = nextCard;
        await delay(2000);
        await loop();
    };
    return loop();
}

function onConnectionAnimation(document, connection, logger) {
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
    connection.on("gameinit", onClose);
}

function onConnectionOpen(connection, serverData, netModeData, myId, logger) {
    const serverId = serverData.data.id;
    assert(serverId === serverData.from, serverData.from);
    const {window, document, settings} = {...netModeData};
    const onNameChange = (name) => {
        logger.log("change name " + name);
        connection.sendRawTo("username", {name, externalId: myId}, serverId);
        addSettingsButton(document, settings);
    };
    const actions = {
        "start": (data) => {
            logger.log("start", data);
            const queue = PromiseQueue(logger);
            const nAdapter = networkAdapter(connection, queue, myId, serverId, logger);
            const myIndex = data.playersRaw.findIndex(p => p.externalId === myId);
            const presenter = initPresenter({...netModeData, queue, myIndex}, data);
            const pAdapter = glueObj.wrapAdapter(presenter, viewActions);
            pAdapter.connectAdapter(nAdapter);
        }
    };
    const handler = actionToHandler(actions);
    connection.registerHandler(handler);
    enterName(window, document, settings, onNameChange);
}

export default async function netMode(netModeData) {
    const {window, document, settings, rngEngine} = {...netModeData};
    const myId = netObj.getMyId(window, settings, rngEngine);
    assert(myId, "No net id");
    const networkLogger = loggerFunc(document, settings, 3);
    const gameChannel = await createSignalingChannel(myId, settings.serverId, window.location, settings, networkLogger);
    const logger = loggerFunc(document, settings, 5);
    if (!gameChannel) {
        logger.error("No chan");
        return;
    }

    const connection = broadcastConnectionFunc(myId, networkLogger, gameChannel);
    onConnectionAnimation(document, connection, logger);
    const lobbyWaiter = new Promise((resolve, reject) => {
        const traceLogger = loggerFunc(document, settings, 1);
        connection.on("gameinit", (serverData) => {
            traceLogger.log("Server id ", serverData, myId);
            onConnectionOpen(connection, serverData, netModeData, myId, logger, settings);
            resolve();
        });
        connection.on("error", (e) => {
            traceLogger.error(e);
            reject(e);
        });
    });

    await connection.connect();
    connection.sendRawAll("join", {});
    await lobbyWaiter;
}
