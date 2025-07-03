import createBooleanForm from "./settings-form.js";

export default function addSettingsButton(document, settings) {
    // const controlPanelTmpl = document.querySelector("#control-panel-tmpl");
    // const controlPanel = controlPanelTmpl.content.cloneNode(true).firstElementChild;
    // document.querySelector(".settings-cont").appendChild(controlPanel);

    const maxBtn = document.querySelector("#maximize-btn");
    const minBtn = document.querySelector("#minimize-btn");
    maxBtn.classList.remove("hidden");

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
