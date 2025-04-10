import clsx from "clsx";

export default function Card(props) {
    const { number, color, id, flipCard, isFlipped, isDisabled, isFound } = props;
 
    const style = {
        backgroundColor: color
    }

    return (
        <div className={clsx('card-container', {'found': isFound, 'disabled': isDisabled})}>
            <div onClick={() => flipCard(id, true)} className={clsx('card', {'flipped': isFlipped})}>
                <div className="card-front">
                    {number}
                </div>
                <div className='card-back' style={style}>
                </div>
            </div>
        </div>
    )
}