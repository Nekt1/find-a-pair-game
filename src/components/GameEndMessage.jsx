export default function GameEndMessage(props) {
    return (
        <>
            <h1>{props.isGameWon ? "YOU WON" : "YOU LOST"}</h1>
        </>
    )
}