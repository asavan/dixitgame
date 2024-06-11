export default function glue(onable, actions) {
    const goodKeys = onable.getActions();
    let glued = 0;
    for (const [action, callback] of actions) {
        if (goodKeys.includes(action)) {
            ++glued;
            onable.on(action, callback);
        }
    }
    return glued;
}
