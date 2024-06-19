export function promiseState(promise) {
    const pendingState = { status: "pending" };

    return Promise.race([promise, pendingState]).then(
        (value) =>
            value === pendingState ? value : { status: "fulfilled", value },
        (reason) => ({ status: "rejected", reason }),
    );
}

export function pluralize(count, noun, suffix = "s") {
    return `${count} ${noun}${count !== 1 ? suffix : ""}`;
}

export function stringifyEvent(e) {
    const obj = {};
    for (const k in e) {
        obj[k] = e[k];
    }
    return JSON.stringify(obj, (_k, v) => {
        if (v instanceof Node) {
            return "Node";
        }
        if (v instanceof Window) {
            return "Window";
        }
        return v;
    }, " ");
}
