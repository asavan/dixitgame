function clickBySelector(dom, selector) {
    const elem = dom.window.document.querySelector(selector);
    if (!elem) {
        console.error("Selector not found", selector);
        throw new Error("Selector not found " + selector);
    }
    elem.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}

export default {
    clickBySelector
};
