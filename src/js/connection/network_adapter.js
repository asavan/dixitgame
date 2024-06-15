import networkMapperObj from "./network_mapper.js";
import glueObj from "../core/glue.js";
import handlersFunc from "../utils/handlers.js";

export default function networkAdapter(connection, queue, myId, serverId, logger) {
    const gameToNetwork = myId === serverId ?
        networkMapperObj.networkMapperServer({logger, connection}) :
        networkMapperObj.networkMapperClient({logger, connection, myId, serverId});
    const on = connection.on;
    const connectObj = (actions) => {
        const mapperActions = glueObj.simpleMapper(actions);
        const networkHandler = handlersFunc(mapperActions.actionKeys(), queue);
        const glued = glueObj.glueSimple(networkHandler, mapperActions);
        connection.registerHandler(networkHandler);
        return glued;
    };
    const getAction = gameToNetwork.getAction;
    return {
        on,
        connectObj,
        getAction
    };
}
