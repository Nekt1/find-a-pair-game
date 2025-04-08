import ReactConfetti from 'react-confetti'
import { useState, useEffect } from 'react'
import data from "./data/cardData.json"
import { nanoid } from 'nanoid'
import { shuffleArray, executeAfterDelay } from './utils/utils'
import Card from './components/Card'
import Timer from './components/Timer'

export default function App() {
    // duplicating to get a pair for each card
    const cardPairData = [...data, ...data]
    const TIME_LEFT_DEFAULT = 120
    const TURN_COUNT_DEFAULT = 20

    const [cards, setCards] = useState(initializeCards)
    const [isDisabled, setIsDisabled] = useState(false)
    const [timeLeft, setTimeLeft] = useState(TIME_LEFT_DEFAULT)
    const [gameLost, setGameLost] = useState(false)
    const [turnCount, setTurnCount] = useState(TURN_COUNT_DEFAULT)
 
    useEffect(() => {

        const timerId = setInterval(() => {
            setTimeLeft(prevTimeLeft => prevTimeLeft - 1)
        }, 1000);

        if (timeLeft === 0) {
            clearInterval(timerId)
            setGameLost(true)
        }

        return () => {
            clearInterval(timerId)
        }
    }, [timeLeft])

    const gameWon = cards.every(card => {
        return card.isFound
    })


    function restartGame() {
        setTimeLeft(TIME_LEFT_DEFAULT)
        setGameLost(false)
        setCards(initializeCards())
    }

    function checkIfSameCard() {
        const flippedCards = cards.filter(card => card.isFlipped)
        if (flippedCards[0].number === flippedCards[1].number) {
            setCards(prevCards => prevCards.map(card => {
                return card.number === flippedCards[0].number ? {...card, isFound: true} : card
            }))
        }
        flippedCards.forEach(card => flipCard(card.id))
    }

    function checkFlippedCards() {
        return cards.filter(card => {
            return card.isFlipped 
        }).length
    }

    function toggleDisable(toDisable) {
        setIsDisabled(prevDisabled => !prevDisabled)
        setCards(prevCards => prevCards.map(card => {
                return {...card, isDisabled: toDisable}
            }))
    }

    async function compareCards() {
        toggleDisable(true); // disables selecting any other cards during an ongoing comparison
        await executeAfterDelay(checkIfSameCard, 1500)
        toggleDisable(false); // enables it back
    }
    
    if (checkFlippedCards() === 2 && !isDisabled) {
        compareCards();
    }

    function flipCard(id) {
        setCards(prevCards => prevCards.map(card => {
            return card.id === id ? {...card, isFlipped: !card.isFlipped} : card
        }))
    }

    function initializeCards() {
        const allCards = []
        shuffleArray(cardPairData)
        cardPairData.forEach(card => {
            allCards.push({
                number: card.number,
                id: nanoid(),
                color: card.color,
                isFlipped: false,
                isDisabled: false,
                isFound: false
            })
        })
        return allCards
    }

    const cardElements = cards.map(card => {
        return <Card 
            number={card.number} 
            color={card.color} 
            key={card.id} 
            id={card.id} 
            flipCard={flipCard} 
            isFlipped={card.isFlipped} 
            isDisabled={card.isDisabled}
            isFound={card.isFound}
        />
    })

    return (
        <>
            <div className="game-container">
                {!gameLost && cardElements}
                {gameWon && (
                    <>
                        <ReactConfetti/>
                        <h1>YOU WON</h1>
                        <button onClick={restartGame}>restart?</button>
                    </>
                )}
                {gameLost && (
                    <>
                        <h1>YOU LOST</h1>
                        <button onClick={restartGame}>restart?</button>
                    </>
                )}
                
            </div>
            <div className="extra-panel">
                {timeLeft > 0 && <Timer timeLeft={timeLeft}/>}
            </div>
        </>
    )

}


