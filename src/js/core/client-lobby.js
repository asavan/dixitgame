import enterName from "../views/names.js";
import loggerFunc from "../views/logger.js";
import {assert} from "../utils/assert.js";
import handlersFunc from "../utils/handlers.js";

export default function lobby({window, document, settings, myId}) {

    const logger = loggerFunc(2, null, settings);

    assert(myId, "No id");

    const commands = [
        "username"
    ];

    const handlers = handlersFunc(commands);
    function on(name, f) {
        return handlers.on(name, f);
    }

    const onNameChange = (name) => {
        logger.log("change name");
        return handlers.call("username", {name, externalId: myId});
    };

    const afterSetup = () => {
        return enterName(window, document, settings, onNameChange);
    };

    const actionKeys = () => handlers.actionKeys();

    return {
        on,
        actionKeys,
        afterSetup,
    };
}
