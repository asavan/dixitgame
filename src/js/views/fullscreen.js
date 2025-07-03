function toggleFullScreen(document, elem) {
    if (!document.fullscreenElement) {
        // If the document is not in full screen mode
        // make the video full screen
        elem.requestFullscreen();
    } else {
        // Otherwise exit the full screen
        document.exitFullscreen?.();
    }
}

export default function fullScreen(document) {
    const btn = document.querySelector("#resize-btn");
    // console.log(btn);
    if (!btn) {
        return;
    }
    const body = document.querySelector("body");
    btn.addEventListener("click", (e) => {
        console.log(e.target);
        toggleFullScreen(document, body);
    });
}
