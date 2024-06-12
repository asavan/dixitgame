function glue(keys, onable, actions) {
    let glued = 0;
    for (const action of keys) {
        const callback = actions.getAction(action);
        if (callback && typeof callback === "function") {
            ++glued;
            onable.on(action, callback);
        }
    }
    return glued;
}

function glueSimple(onable, actions) {
    return glue(onable.actionKeys(), onable, actions);
}

function simpleMapper(mapper) {
    const getAction = (name) => mapper[name];
    const actionKeys = () => Object.keys(mapper);
    return {
        actionKeys,
        getAction
    };
}

function glueSimpleByObj(onable, mapper) {
    return glueSimple(onable, simpleMapper(mapper));
}

export default {
    glue,
    glueSimple,
    glueSimpleByObj,
    simpleMapper
};
