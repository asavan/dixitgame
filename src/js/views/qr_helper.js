import { QRCodeSVG } from "@akamfoad/qrcode";

export function bigPicture(elem) {
    elem.addEventListener("click", () => elem.classList.toggle("big"));
}

function chomp(string, c) {
    if (string.charAt(string.length - c.length) === c) {
        return string.substr(0, string.length - c.length);
    }
    return string;
}

function renderQRCodeSVG(text, divElement) {
    const qrSVG = new QRCodeSVG(text, {
        level: "M",
        padding: 3,
        image: {
            source: "./images/drixit_icon.svg",
            width: "10%",
            height: "20%",
            x: "center",
            y: "center",
        },
    });
    divElement.innerHTML = qrSVG.toString();
    bigPicture(divElement);
    return divElement;
}

export function removeElem(el) {
    if (el) {
        el.remove();
    }
}

export function makeQrPlain(staticHost, document, selector) {
    const url = new URL(staticHost);
    const urlStr = chomp(url.toString(), "/");
    console.log("enemy url", urlStr);
    return renderQRCodeSVG(urlStr, document.querySelector(selector));
}

export function makeQr(window, document, settings) {
    const staticHost = settings.sh || window.location.origin;
    return makeQrPlain(staticHost, document, ".qrcode");
}
