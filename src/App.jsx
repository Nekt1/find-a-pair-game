import ReactConfetti from 'react-confetti'
import { useState, useEffect, useReducer, useRef } from 'react'
import data from "./data/cardData.json"
import { nanoid } from 'nanoid'
import { shuffleArray, executeAfterDelay } from './utils'
import Card from './components/Card'
import Timer from './components/Timer'
import TurnCounter from './components/TurnCounter'
import YouWin from './components/YouWin'

const cardPairData = [...data.cards, ...data.cards]
const REMAINING_TIME = data.REMAINING_TIME
const REMAINING_TURNS = data.REMAINING_TURNS
const DIFFICULTY_OPTION = data.difficulty

const initialGameState = {
    isGameOver: false,
    isGameWon: false,
    // turnCounter: REMAINING_TURNS
}

function countFlippedCards(cards) {
    return cards.filter(card => {
        return card.isFlipped 
    }).length
}

function reducer(state, action) {
    switch (action.type) {
        case 'GAME_WON':
            return {...state, isGameWon: true}
        case 'GAME_LOST':
            return {...state, isGameOver: true};
        case 'GAME_RESET':
            return {...state, isGameOver: false, isGameWon: false}
        // case 'DECREASE_TURN_COUNT':
        //     return {...state, turnCounter: REMAINING_TURNS - 1}
    }
}

export default function App() {

    const [state, dispatch] = useReducer(reducer, initialGameState)
    const [cards, setCards] = useState(initializeCards)
    const [isDisabled, setIsDisabled] = useState(false)
    const [timeLeft, setTimeLeft] = useState(REMAINING_TIME)
    const timerRef = useRef(null)
    const [turnsLeft, setTurnsLeft] = useState(REMAINING_TURNS)
 
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prevTimeLeft => prevTimeLeft - 1)
        }, 1000);

        if (timeLeft === 0 && timerRef.current) {
            clearInterval(timerRef.current)
            dispatch({type: 'GAME_LOST'})
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [timeLeft])

    useEffect(() => {
        if (state.isGameWon || state.isGameOver) {
            if (timerRef.current) clearInterval(timerRef.current)
        }

    }, [state.isGameWon, state.isGameOver])

    if (cards.every(card => card.isFound) && !state.isGameWon) {
        dispatch({type: "GAME_WON"})
    }

    function restartGame() {
        setTimeLeft(REMAINING_TIME)
        setTurnsLeft(REMAINING_TURNS)
        dispatch({type: 'GAME_RESET'})
        setCards(initializeCards())
    }

    function checkIfSameCard() {
        let checkedSuccessfully = false;
        const flippedCards = cards.filter(card => card.isFlipped)
        if (flippedCards[0].number === flippedCards[1].number) {
            setCards(prevCards => prevCards.map(card => {
                return card.number === flippedCards[0].number ? {...card, isFound: true} : card
            }))
            checkedSuccessfully = true;
        }
        flippedCards.forEach(card => flipCard(card.id))
        return checkedSuccessfully;
    }

    function toggleDisable(toDisable) {
        setIsDisabled(prevDisabled => !prevDisabled)
        setCards(prevCards => prevCards.map(card => {
                return {...card, isDisabled: toDisable}
            }))
    }

    async function compareCards() {
        toggleDisable(true); // disables selecting any other cards during an ongoing comparison
        const result = await executeAfterDelay(checkIfSameCard, 1500) 
        toggleDisable(false); // enables it back
        if (turnsLeft <= 0 && !result) { // additional check if no more turns, but the last comparison was successful
            dispatch({type: "GAME_LOST"})
        }
    }
    
    if (countFlippedCards(cards) === 2 && !isDisabled) {
        compareCards();
    }

    function flipCard(id, manualFlip = false) {
        setCards(prevCards => prevCards.map(card => {
            return card.id === id ? {...card, isFlipped: !card.isFlipped} : card
        }))
        if (manualFlip) {
            setTurnsLeft(prevTurns => prevTurns - 1)
            // add checc for single flip
        }
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
            <div className="container">
                {!state.isGameOver && cardElements}
                {state.isGameWon && (
                    <>
                        <ReactConfetti/>
                        <YouWin/>
                        <button onClick={restartGame}>restart?</button>
                    </>
                )}
                {state.isGameOver && (
                    <>
                        <h1>YOU LOST</h1>
                        <button onClick={restartGame}>restart?</button>
                    </>
                )}
                
            </div>
            <div className="extra-panel">
                {timeLeft >= 0 && <Timer timeLeft={timeLeft}/>}
                {turnsLeft >= 0 && <TurnCounter turnsLeft={turnsLeft}/>}
                <button className="btn btn-reset"onClick={restartGame}>reset game</button>
            </div>
        </>
    )

}


