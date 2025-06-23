export function nonNegativeDigitOnIndex(arr, ind) {
    if (!arr) {
        return false;
    }
    const elem = arr[ind];
    if (elem === undefined || elem === null) {
        return false;
    }
    return elem >= 0;
}
