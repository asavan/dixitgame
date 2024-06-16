import loggerFunc from "../views/logger.js";
import { getMyId } from "../connection/common.js";
import PromiseQueue from "../utils/async-queue.js";
import initPresenter from "../rules/presenter.js";
import emptyEngine from "../rules/default-engine.js";
import { emptyPlayer } from "../rules/default-engine.js";
import dixit from "../rules/dixit.js";
import viewActions from "../rules/view_actions.js";
import engineActions from "../rules/engine_actions.js";
import glueObj from "../core/glue.js";
import rngFunc from "../utils/random.js";
import { delay } from "../utils/timer.js";
import urlGenerator from "../views/get_image_url.js";



export default async function hotseat({window, document, settings, rngEngine}) {
    if (!settings.seed) {
        settings.seed = rngFunc.makeId(6, rngEngine);
    }
    const myId = getMyId(window, settings, rngEngine);
    settings.clickAll = true;
    const players = [];
    players.push({name: "player", externalId: myId, is_bot: true});
    for (let i = 1; i < settings.botCount + 1; ++i) {
        const name = "client " + i;
        const externalId = "client " + i;
        players.push({name, externalId, is_bot: true});
    }

    const myIndex = players.findIndex(p => p.externalId === myId);
    const logger = loggerFunc(3, null, settings);
    const queue = PromiseQueue(logger);
    const urlGenRaw = urlGenerator().makeKUrlGen(settings.cardsCount, rngEngine).getData();
    const playersRaw = players.map(p => emptyPlayer(p.name, p.externalId));
    const presenter = initPresenter({document, settings, rngEngine, queue, myIndex},
        {...emptyEngine(settings), playersRaw, urlGenRaw});
    const gameCore = dixit.game({settings, rngEngine, delay,
        logger, playersCount: players.length});
    const pAdapter = glueObj.wrapAdapter(presenter, viewActions);
    const eAdapter = glueObj.wrapAdapter(gameCore, engineActions);
    eAdapter.connectAdapter(pAdapter);


    gameCore.on("gameover", () => {
        const btnAdd = document.querySelector(".butInstall");
        btnAdd.classList.remove("hidden2");
    });
    await gameCore.start(presenter.toJson());
}
