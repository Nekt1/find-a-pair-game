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

export function flippedCardsCount(cards) {
    return cards.filter(card => {
        return card.isFlipped 
    }).length
}

export function getFlippedCards(cards) {
    return cards.filter(card => card.isFlipped)
}

export function matchedCardsAmount(cards) {
    return cards.filter(card => {
        return card.isMatched
    }).length
}