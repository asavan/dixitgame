export default function newPlayer(arr, ind, oldScore, name) {
    const i = ind;
    const deck = [...arr];
    let score = oldScore || 0;
    const n = name;

    const getIndex = () => i;
    const addCard = (card) => deck.push(card);
    const pile = () => [...deck];
    const cleanHand = () => {deck.length = 0;};
    const updateScore = (s) => { score += s; };
    const setScore = (s) => { score = s; };
    const getScore = () => score;
    const hasCard = (card) => deck.includes(card);
    const hasEmptyHand = () => deck.length === 0;
    const isUno = () => deck.length === 1;

    const removeCard = (card) => {
        const removeIndex = deck.indexOf(card);
        if (removeIndex < 0) {
            console.error("Wrong card to delete");
            return removeIndex;
        }
        deck.splice(removeIndex, 1);
        return removeIndex;
    };

    const getName = () => n;

    const toJson = () => {
        return {
            score,
            name,
            pile: pile()
        };
    };

    return {
        toJson,
        getName,
        addCard,
        pile,
        isUno,
        getIndex,
        cleanHand,
        removeCard,
        updateScore,
        getScore,
        setScore,
        hasEmptyHand,
        hasCard
    };
}
