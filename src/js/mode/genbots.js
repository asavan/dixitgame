export default function genbots(myId, settings) {
    const players = [];
    players.push({name: "player", externalId: myId, is_bot: settings.playerIsBot});
    for (let i = 1; i < settings.botCount + 1; ++i) {
        const name = "client " + i;
        const externalId = "client" + i;
        players.push({name, externalId, is_bot: true});
    }
    return players;
}
