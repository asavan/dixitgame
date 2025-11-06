import wakeLock from "../utils/wake-lock.js";
import {loggerFunc} from "netutils";


export default function enterName(window, document, settings, onUsermameExternal) {
    const traceLogger = loggerFunc(document, settings, 1);
    const formCont = document.querySelector(".name-form-cont");
    const data = window.sessionStorage.getItem("username");
    const notifyExt = (name) => {
        if (onUsermameExternal && typeof onUsermameExternal === "function") {
            console.log("Send name data", name);
            onUsermameExternal(name);
        }
    };

    if (data) {
        formCont.replaceChildren();
        notifyExt(data);
        return;
    }

    const formItem = document.querySelector("#nameform");
    const formClone = formItem.content.cloneNode(true).firstElementChild;
    formCont.replaceChildren(formClone);

    const form = document.querySelector(".nameform");
    const input = document.querySelector(".nameinput");
    const field = document.querySelector(".container");
    if (settings.mode === "net") {
        field.classList.add("hidden");
    }

    function checkName(name) {
        if (name.length > settings.maxNameLen) {
            alert("Choose shorter name!");
            return false;
        }
        return true;
    }

    function onName(name) {
        if (!checkName(input.value)) {
            return;
        }
        // TODO maybe extract
        wakeLock.init(traceLogger);
        window.sessionStorage.setItem("username", name);
        notifyExt(name);
        form.classList.add("hidden");
        field.classList.remove("hidden");
        formCont.replaceChildren();
    }

    form.addEventListener("submit", (evt) => {
        evt.preventDefault();
        onName(input.value);
    });
}
