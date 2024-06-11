export default function glue(onable, actions) {
    const goodKeys = onable.actionKeys();
    let glued = 0;
    for (const [action, callback] of Object.entries(actions)) {
        if (goodKeys.includes(action)) {
            ++glued;
            onable.on(action, callback);
        }
    }
    return glued;
}
