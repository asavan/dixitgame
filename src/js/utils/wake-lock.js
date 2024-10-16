// Create a reference for the Wake Lock.
let wakeLock = null;

// create an async function to request a wake lock
async function lock() {
    try {
        wakeLock = await navigator.wakeLock.request("screen");
        console.log("Awake");
    } catch (err) {
        console.error("wakeLock rejected", err);
    }
}

function init() {
    lock();
    document.addEventListener("visibilitychange", async () => {
        console.log("visibilitychange", document.visibilityState);
        if (document.visibilityState === "visible") {
            await lock();
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
