
export default function PromiseQueue(logger) {
    let queue = Promise.resolve();

    const add = (operation) => new Promise((resolve, reject) => {
        queue = queue
            .then(operation)
            .then(resolve)
            .catch((error) => {
                logger.log(error);
                reject(error);
            });
    });
    return {add};
}
