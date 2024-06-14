export default function choosePlace(document, {onSeatsFinished, onSwap, onClick}, players) {
    const box = document.querySelector(".places");
    box.replaceChildren();
    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    box.appendChild(places);
    const nonBannedPlayers = players.filter(p => !p.banned && !p.disconnected);
    const increaseDeg = 360 / nonBannedPlayers.length;
    let angleDeg = 90;
    let selected = null;
    function onSelect(e) {
        e.preventDefault();
        if (!e.target || e.target.dataset.id == null) {
            console.log("WRONG TARGET");
            return;
        }
        onClick(Number.parseInt(e.target.dataset.id));

        if (selected) {
            selected.classList.remove("selected");
            onSwap(selected.dataset.id, e.target.dataset.id);
            selected = null;
            return;
        }

        selected = e.target;
        selected.classList.add("selected");
    }

    function onAllSeated(e) {
        e.preventDefault();
        box.replaceChildren();
        return onSeatsFinished();
    }

    places.addEventListener("click", onSelect);
    const N = nonBannedPlayers.length;
    let count = 0;
    for (let i = 0; i < players.length; ++i) {
        const player = players[i];
        if (player == null) {
            angleDeg += increaseDeg;
            ++count;
            continue;
        }
        if (player.banned) {
            continue;
        }
        const elem = document.createElement("li");
        elem.innerText = players[i].name;
        elem.dataset.id = i;
        elem.dataset.angle = angleDeg + "deg";
        elem.style.setProperty("--angle-deg", angleDeg + "deg");
        const pathPercent = 25 + count*100/N;
        elem.style.setProperty("--path-pc", pathPercent);
        elem.classList.add("circle", "clickable");
        angleDeg += increaseDeg;
        ++count;
        places.appendChild(elem);
    }

    {
        const start = document.createElement("button");
        start.textContent = "Start";
        start.classList.add("start-button", "clickable", "flat-button");
        start.addEventListener("click", onAllSeated);
        box.appendChild(start);
    }
}
