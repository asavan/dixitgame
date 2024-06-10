
export default function viewActions(presenter) {
    return {
        "move": presenter.onMove,
        "changeState": presenter.onChangeState,
        "shuffle": presenter.onShuffle,
        "deal": presenter.onDeal
    };
}
