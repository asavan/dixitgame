function networkMapperServer({logger, connection}) {
    const getAction = (handlerName) => {
        return (data) => {
            let ignore;
            if (data && data.externalId) {
                logger.log("Ignore", data.externalId);
                ignore = [data.externalId];
            }
            return connection.sendRawAll(handlerName, data, ignore);
        };
    };
    return {
        getAction
    };
}

function networkMapperClient({logger, connection, myId, serverId}) {
    const getAction = (handlerName) => {
        return (data) => {
            if (data && data.externalId && myId !== data.externalId) {
                logger.log("Ignore", data.externalId);
                return;
            }
            return connection.sendRawTo(handlerName, data, serverId);
        };
    };
    return {
        getAction
    };
}

export default {
    networkMapperClient,
    networkMapperServer
};
