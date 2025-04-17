import ReactConfetti from "react-confetti";
import { useState, useEffect, useReducer, useRef } from "react";
import difficulties from "./data/difficulties.json";
import { nanoid } from "nanoid";
import {
	shuffleArray,
	executeAfterDelay,
	flippedCardsCount,
	getFlippedCards,
	matchedCardsAmount,
} from "./utils";
import Card from "./components/Card/Card";
import Timer from "./components/Timer/Timer";
import TurnCounter from "./components/TurnCounter/TurnCounter";
import GameEndMessage from "./components/GameEndMessage/GameEndMessage";
import Settings from "./components/Settings/Settings";
import clsx from "clsx";


const defaultDifficulty = 'NORMAL'

const gameState = {
	isGameOver: false,
	isGameWon: false,
};

function reducer(state, action) {
	switch (action.type) {
		case "GAME_WON":
			return { ...state, isGameWon: true };
		case "GAME_LOST":
			return { ...state, isGameOver: true };
		case "GAME_RESET":
			return { ...state, isGameOver: false, isGameWon: false };
	}
}

export default function App() {
	const [difficultyOption, setDifficultyOption] = useState(defaultDifficulty);
	const [state, dispatch] = useReducer(reducer, gameState);
	const [isDisabled, setIsDisabled] = useState(false);
	const [timeLeft, setTimeLeft] = useState(
		difficulties[defaultDifficulty].REMAINING_TIME,
	);
	const [turnsLeft, setTurnsLeft] = useState(
		difficulties[defaultDifficulty].REMAINING_TURNS,
	);
	const [isSettingsToggled, setIsSettingsToggled] = useState(false);
    const [cards, setCards] = useState(
		initializeCards(difficulties[defaultDifficulty].CARDS_DATA),
	);
	const timerRef = useRef(null);

	useEffect(() => {
		timerRef.current = setInterval(() => {
			setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
		}, 1000);

		if (timeLeft === 0 && timerRef.current) {
			clearInterval(timerRef.current);
			dispatch({ type: "GAME_LOST" });
		}

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [timeLeft]);

	useEffect(() => {
		if (state.isGameWon || state.isGameOver) {
			if (timerRef.current) clearInterval(timerRef.current);
		}
	}, [state.isGameWon, state.isGameOver]);

	useEffect(() => {
		restartGame();
	}, [difficultyOption]);

	if (cards.every((card) => card.isMatched) && !state.isGameWon) {
		// if all cards matched, game is won
		dispatch({ type: "GAME_WON" });
	}

	function restartGame() {
        setIsSettingsToggled(false);
		setTimeLeft(difficulties[difficultyOption].REMAINING_TIME);
		setTurnsLeft(difficulties[difficultyOption].REMAINING_TURNS);
		dispatch({ type: "GAME_RESET" });
		setCards(initializeCards(difficulties[difficultyOption].CARDS_DATA));
	}

	function checkIfSameCard(currentFlippedCards) {
		const [firstCard, secondCard] = currentFlippedCards;
		let isSuccessfulComparison = false;

		if (firstCard.number === secondCard.number) {
			setCards((prevCards) =>
				prevCards.map((card) => {
					return card.number === firstCard.number
						? { ...card, isMatched: true }
						: card;
				}),
			);
			isSuccessfulComparison = true;
		}
		currentFlippedCards.forEach((card) => flipCard(card.id));
		return isSuccessfulComparison;
	}

	function toggleDisabledState(disabledState) {
		setIsDisabled((prevDisabled) => !prevDisabled);
		setCards((prevCards) =>
			prevCards.map((card) => {
				return { ...card, isDisabled: disabledState };
			}),
		);
	}

	async function checkForMatch() {
		toggleDisabledState(true);

		const turnAmountLeft = turnsLeft - 1;
		setTurnsLeft(turnAmountLeft);

		const currentFlippedCards = getFlippedCards(cards);
		const result = await executeAfterDelay(
			() => checkIfSameCard(currentFlippedCards),
			1200,
		);
		toggleDisabledState(false);

		if (turnAmountLeft === 0) {
			if (!result) dispatch({ type: "GAME_LOST" });
			if (result && matchedCardsAmount(cards) < cards.length)
				dispatch({ type: "GAME_LOST" });
		}
	}

	if (flippedCardsCount(cards) === 2 && !isDisabled) {
		checkForMatch();
	}

	function flipCard(id, manualFlip = false) {
		setCards((prevCards) =>
			prevCards.map((card) => {
				if (manualFlip)
					return card.id === id && !card.isFlipped
						? { ...card, isFlipped: !card.isFlipped }
						: card; // prevents from flipping already flipped cards back
				return card.id === id ? { ...card, isFlipped: !card.isFlipped } : card;
			}),
		);
	}

	function initializeCards(cardData) {
		const cardPairData = [...cardData, ...cardData];
		shuffleArray(cardPairData);

		const allCards = [];
		cardPairData.forEach((card) => {
			allCards.push({
				number: card.number,
				id: nanoid(),
				sourceImg: card.sourceImg,
				isFlipped: false,
				isDisabled: false,
				isMatched: false,
			});
		});
		return allCards;
	}

	function toggleSettings() {
		setIsSettingsToggled((prevToggleValue) => !prevToggleValue);
	}

	function handleDifficultyChange(event) {
		setDifficultyOption(event.target.value);
	}

	const cardElements = cards.map((card) => {
		return (
			<Card
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
		);
	});

	return (
		<>
			<Settings
				handleDifficultyChange={handleDifficultyChange}
				toggleSettings={toggleSettings}
				isSettingsToggled={isSettingsToggled}
				difficultyOption={difficultyOption}
			/>
			<div className="container">
				<div
					className={clsx(
						"cardWrapper",
						(state.isGameOver || state.isGameWon) && "hidden",
					)}
				>
					{!state.isGameOver && cardElements}
				</div>
				{(state.isGameOver || state.isGameWon) && (
					<div className="endgameMessageWrapper">
						{state.isGameWon && <ReactConfetti />}
						<GameEndMessage isGameWon={state.isGameWon} />
					</div>
				)}
				<div className="extrasPanel">
					{timeLeft >= 0 && <Timer timeLeft={timeLeft} />}
					{turnsLeft >= 0 && <TurnCounter turnsLeft={turnsLeft} />}
					<button
						className={clsx("btn", "btnReset", { disabled: isDisabled })}
						onClick={restartGame}
                        type="button"
                    >
						RESTART
					</button>
				</div>
			</div>
		</>
	);
}
