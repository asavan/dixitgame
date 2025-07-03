import createBooleanForm from "./settings-form.js";
import fullScreen from "./fullscreen.js";

export default function addSettingsButton(document, settings) {
    const controlPanelTmpl = document.querySelector("#control-panel-tmpl");
    const controlPanel = controlPanelTmpl.content.cloneNode(true).firstElementChild;
    const settingsControl = document.querySelector(".settings-cont");
    settingsControl.replaceChildren(controlPanel);

    const maxBtn = document.querySelector("#maximize-btn");
    const minBtn = document.querySelector("#minimize-btn");
    const resizeBtn = document.querySelector("#resize-btn");
    if (settings.mode === "server") {
        resizeBtn.classList.add("hidden");
        maxBtn.classList.remove("hidden");
    } else {
        resizeBtn.classList.remove("hidden");
        maxBtn.classList.add("hidden");
        fullScreen(document, resizeBtn);
    }

    maxBtn.addEventListener("click", (e) => {
        e.preventDefault();
        minBtn.classList.remove("hidden");
        const controlPanel = document.querySelector("#control-panel");
        controlPanel.classList.remove("minimized");
        const formInstance = createBooleanForm(settings);
        formInstance.appendTo(".panel-content");
        minBtn.addEventListener("click", e => {
            e.preventDefault();
            minBtn.classList.add("hidden");
            controlPanel.classList.add("minimized");
            formInstance.destroy();
        });
    });
}
