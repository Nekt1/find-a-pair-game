import clsx from "clsx";

export default function Card(props) {
    const { number, sourceImg, id, flipCard, isFlipped, isDisabled, isMatched } = props;

    return (
        <div className={clsx('card-container', {'matched': isMatched, 'disabled': isDisabled})}>
            <div onClick={() => flipCard(id, true)} className={clsx('card', {'flipped': isFlipped})}>
                <div className="card-front">
                </div>
                <div className='card-back'>
                    <img className="backIcon" src={sourceImg}/>
                </div>
            </div>
        </div>
    )
}