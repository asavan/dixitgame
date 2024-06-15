import { assert } from "../utils/assert.js";

function glue(keys, onable, actions) {
    let glued = 0;
    for (const action of keys) {
        const callback = actions.getAction(action);
        if (callback && typeof callback === "function") {
            ++glued;
            onable.on(action, callback);
        } else {
            console.error("Bad action", action);
            console.trace("Bad action");
        }
    }
    assert(glued > 0, "Bad glue");
    return glued;
}

function glueSimple(onable, actions) {
    return glue(onable.actionKeys(), onable, actions);
}

function simpleMapper(mapper) {
    const keys = Object.keys(mapper);
    const getAction = (name) => mapper[name];
    const actionKeys = () => keys;
    return {
        actionKeys,
        getAction
    };
}

function glueSimpleByObj(onable, mapper) {
    return glueSimple(onable, simpleMapper(mapper));
}

function wrapGlue(onable) {
    const connectObj = (mapper) => glueSimpleByObj(onable, mapper);
    const connect = (actions) => glueSimple(onable, actions);
    const connectMapper = connect;
    return {
        connect,
        connectMapper,
        connectObj
    };
}

function wrapAdapter(core, actionFunc) {
    const actions = actionFunc(core);
    const mapper = simpleMapper(actions);
    const glued = wrapGlue(core);
    const connectMapper = glued.connectMapper;
    const getAction = mapper.getAction;
    const actionKeys = mapper.actionKeys;
    const connectAdapter = (adapter) => {
        glueSimple(core, adapter);
        adapter.connectMapper(mapper);
    };
    return {
        connectMapper,
        actionKeys,
        connectAdapter,
        getAction
    };
}

export default {
    glue,
    glueSimple,
    glueSimpleByObj,
    wrapGlue,
    wrapAdapter,
    simpleMapper
};
