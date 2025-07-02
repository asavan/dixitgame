import createBooleanForm from "./settings-form.js";

export default function addSettingsButton(document, settings) {
    const controlPanelTmpl = document.querySelector("#control-panel-tmpl");
    const controlPanel = controlPanelTmpl.content.cloneNode(true).firstElementChild;
    document.querySelector(".settings-cont").appendChild(controlPanel);

    document.querySelector("#maximize-btn").addEventListener("click", (e) => {
        e.preventDefault();
        const controlPanel = document.querySelector("#control-panel");
        controlPanel.classList.remove("minimized");
        const formInstance = createBooleanForm(settings);
        formInstance.appendTo(".panel-content");
        document.querySelector("#minimize-btn").addEventListener("click", e => {
            e.preventDefault();
            controlPanel.classList.add("minimized");
            formInstance.destroy();
        });
    });
}
