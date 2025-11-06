import enterName from "../views/names.js";
import {
    assert, handlersFunc,
    loggerFunc
} from "netutils";

export default function lobby({window, document, settings, myId}) {

    const logger = loggerFunc(document, settings, 2);

    assert(myId, "No id");

    const commands = [
        "username"
    ];

    const handlers = handlersFunc(commands);
    const {actionKeys, on} = handlers;
    const onNameChange = (name) => {
        logger.log("change name");
        return handlers.call("username", {name, externalId: myId});
    };

    const afterSetup = () => enterName(window, document, settings, onNameChange);

    return {
        on,
        actionKeys,
        afterSetup,
    };
}
