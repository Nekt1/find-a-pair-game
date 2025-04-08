export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
}

export function executeAfterDelay(fn, delay) {
    return new Promise(resolve => {
        setTimeout(() => resolve(fn()), delay)
    })
}