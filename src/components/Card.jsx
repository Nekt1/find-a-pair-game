export default function Card(props) {

    const style = {
        backgroundColor: props.color
    }

    function flipCard() {
        props.flipCard(props.id)
    }

    return (
    <div className={`card-container ${props.isFound ? 'found' : ''} ${props.isDisabled ? 'disabled' : ''}`}>
        <div onClick={flipCard} className={`card ${props.isFlipped ? 'flipped' : ''}`}>
            <div className="card-front">
                {props.number}
            </div>
            <div className='card-back' style={style}>
            </div>
        </div>
    </div>
    )
}