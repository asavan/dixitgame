// Create a reference for the Wake Lock.
let wakeLock = null;

// create an async function to request a wake lock
async function lock(logger) {
    try {
        wakeLock = await navigator.wakeLock.request("screen");
        logger.log("Awake");
    } catch (err) {
        logger.error("wakeLock rejected", err);
    }
}

function init(logger) {
    lock(logger);
    document.addEventListener("visibilitychange", async () => {
        logger.log("visibilitychange", document.visibilityState);
        if (document.visibilityState === "visible") {
            await lock(logger);
        }
    });
}

function release() {
    if (!wakeLock) {
        return;
    }
    wakeLock.release().then(() => {
        wakeLock = null;
    });
}

export default {init, lock, release};
