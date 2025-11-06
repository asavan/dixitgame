import initPresenter from "../rules/presenter.js";
import emptyEngine from "../rules/default-engine.js";
import { emptyPlayer } from "../rules/default-engine.js";
import dixit from "../rules/dixit.js";
import viewActions from "../rules/view_actions.js";
import engineActions from "../rules/engine_actions.js";
import glueObj from "../core/glue.js";
import urlGenerator from "../views/get_image_url.js";

import { delay, loggerFunc, PromiseQueue } from "netutils";

export default function startServerWithUI({window, document, settings, rngEngine}, myId, players) {
    const myIndex = players.findIndex(p => p.externalId === myId);
    const loggerCore = loggerFunc(document, settings, 3);
    const queue = PromiseQueue(loggerCore);
    const urlGenRaw = urlGenerator().makeKUrlGen(settings.cardsCount, rngEngine).getData();
    const playersRaw = players.map(p => emptyPlayer(p.name, p.externalId));
    const presenter = initPresenter({document, settings, rngEngine, queue, myIndex},
        {...emptyEngine(settings), playersRaw, urlGenRaw});
    const gameCore = dixit.game({settings, rngEngine, delay,
        logger: loggerCore, playersCount: players.length});
    const pAdapter = glueObj.wrapAdapter(presenter, viewActions);
    const eAdapter = glueObj.wrapAdapter(gameCore, engineActions);
    eAdapter.connectAdapter(pAdapter);

    // for debug. delete this
    window.presenter = presenter;
    window.gameCore = gameCore;

    const start = () => gameCore.start(presenter.toJson());

    const getCoreAdapter = () => eAdapter;
    const getPresenterAdapter = () => pAdapter;
    const getCore = eAdapter.getCore;

    return {
        getCore,
        getCoreAdapter,
        getPresenterAdapter,
        start
    };
}
