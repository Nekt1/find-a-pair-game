import ReactConfetti from 'react-confetti'
import { useState, useEffect, useReducer, useRef } from 'react'
import data from "./data/cardData.json"
import { nanoid } from 'nanoid'
import { shuffleArray, executeAfterDelay, flippedCardsCount, getFlippedCards, matchedCardsAmount } from './utils'
import Card from './components/Card'
import Timer from './components/Timer'
import TurnCounter from './components/TurnCounter'
import GameEndMessage from './components/GameEndMessage'
import Settings from './components/Settings'
import clsx from "clsx";

let REMAINING_TIME, REMAINING_TURNS, CARDS_DATA;

// used only for initial setup as a "default" difficulty setter
const defaultDifficulty = "NORMAL"
const setup = data.difficultyOptions.find(difficultyOption => difficultyOption.difficulty === defaultDifficulty)['setup'];
({REMAINING_TIME, REMAINING_TURNS, CARDS_DATA} = setup);

const gameState = {
    isGameOver: false,
    isGameWon: false,
}

function adjustDifficulty(difficultyOption) {
    data.difficultyOptions.forEach(option => {
        if (option.difficulty === difficultyOption) {
            ({ REMAINING_TIME, REMAINING_TURNS, CARDS_DATA } = option.setup);
        }
    })
}

function reducer(state, action) {
    switch (action.type) {
        case 'GAME_WON':
            return {...state, isGameWon: true}
        case 'GAME_LOST':
            return {...state, isGameOver: true};
        case 'GAME_RESET':
            return {...state, isGameOver: false, isGameWon: false}
    }
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, gameState)
    const [cards, setCards] = useState(initializeCards)
    const [isDisabled, setIsDisabled] = useState(false)
    const [timeLeft, setTimeLeft] = useState(REMAINING_TIME)
    const [turnsLeft, setTurnsLeft] = useState(REMAINING_TURNS)
    const [isSettingsToggled, setIsSettingsToggled] = useState(false)
    const [difficultyOption, setDifficultyOption] = useState('NORMAL')
    const timerRef = useRef(null)
 
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

    useEffect(() => {
        restartGame(difficultyOption)
    }, [difficultyOption])

    if (cards.every(card => card.isMatched) && !state.isGameWon) { // if all cards matched, game is won
        dispatch({type: "GAME_WON"})
    }

    function restartGame(difficultyOption = false) {
        if (difficultyOption) {
            adjustDifficulty(difficultyOption)
        }
        setTimeLeft(REMAINING_TIME)
        setTurnsLeft(REMAINING_TURNS)
        dispatch({type: 'GAME_RESET'})
        setCards(initializeCards())
        setIsSettingsToggled(false)
    }

    function checkIfSameCard(currentFlippedCards) {
        const [firstCard, secondCard] = currentFlippedCards
        let isSuccessfulComparison = false;

        if (firstCard.number === secondCard.number) {
            setCards(prevCards => prevCards.map(card => {
                return card.number === firstCard.number ? {...card, isMatched: true} : card
            }))
            isSuccessfulComparison = true;
        }
        currentFlippedCards.forEach(card => flipCard(card.id))
        return isSuccessfulComparison;
    }

    function toggleDisabledState(disabledState) {
        setIsDisabled(prevDisabled => !prevDisabled)
        setCards(prevCards => prevCards.map(card => {
                return {...card, isDisabled: disabledState}
            }))
    }

    async function checkForMatch() {
        toggleDisabledState(true); // disables selecting any other cards during an ongoing comparison

        const turnAmountLeft = turnsLeft - 1
        setTurnsLeft(turnAmountLeft)

        const currentFlippedCards = getFlippedCards(cards)
        const result = await executeAfterDelay(() => checkIfSameCard(currentFlippedCards), 1200) 
        toggleDisabledState(false); // enables it back

        if (turnAmountLeft === 0) { // if no more turns & last result is unsuccessful - game lost
            if (!result) dispatch({type: "GAME_LOST"})
            if (result && matchedCardsAmount(cards) < cards.length) dispatch({type: "GAME_LOST"})
        }
    }
    
    if (flippedCardsCount(cards) === 2 && !isDisabled) {
        checkForMatch();
    }

    function flipCard(id, manualFlip = false) {
        setCards(prevCards => prevCards.map(card => {
            if (manualFlip) return (card.id === id && !card.isFlipped) ? {...card, isFlipped: !card.isFlipped} : card // prevents from flipping already flipped cards back
            return card.id === id ? {...card, isFlipped: !card.isFlipped} : card
        }))
    }

    function initializeCards() { // used during initialization and game restarts
        const cardPairData = [...CARDS_DATA, ...CARDS_DATA]
        shuffleArray(cardPairData)

        const allCards = []
        cardPairData.forEach(card => {
            allCards.push({
                number: card.number,
                id: nanoid(),
                sourceImg: card.sourceImg,
                isFlipped: false,
                isDisabled: false,
                isMatched: false
            })
        })
        return allCards
    }

    function toggleSettings() {
        setIsSettingsToggled(prevToggleValue => !prevToggleValue)
    }

    function handleDifficultyChange(event) {
        setDifficultyOption(event.target.value)
    }

    const cardElements = cards.map(card => {
        return <Card 
            number={card.number} 
            color={card.color} 
            key={card.id} 
            id={card.id} 
            flipCard={flipCard} 
            sourceImg={card.sourceImg}
            isFlipped={card.isFlipped} 
            isDisabled={card.isDisabled}
            isMatched={card.isMatched}
        />
    })

    return (
        <>  
            <Settings 
                handleDifficultyChange={handleDifficultyChange} 
                toggleSettings={toggleSettings}
                isSettingsToggled={isSettingsToggled}
                difficultyOption={difficultyOption}
            />
            <div className="container">
                <div className={clsx("card-wrapper", (state.isGameOver || state.isGameWon) && "hidden")}>
                    {!state.isGameOver && cardElements}
                </div>
                {(state.isGameOver || state.isGameWon) &&
                    <div className="endgame-message-wrapper">
                        {state.isGameWon && <ReactConfetti/>}
                        <GameEndMessage isGameWon={state.isGameWon}/>
                    </div>
                }
                <div className="extras-panel">
                    {timeLeft >= 0 && <Timer timeLeft={timeLeft}/>}
                    {turnsLeft >= 0 && <TurnCounter turnsLeft={turnsLeft}/>}
                    <button className={clsx("btn", "btn-reset", {'disabled': isDisabled})} onClick={restartGame}>RESTART</button>
                </div>
            </div>
        </>
    )
}