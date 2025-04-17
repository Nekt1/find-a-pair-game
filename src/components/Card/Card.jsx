import clsx from "clsx";
import styles from './styles.module.css'

export default function Card(props) {
	const { sourceImg, id, flipCard, isFlipped, isDisabled, isMatched, is } = props;

	return (
		<div
			className={clsx(styles.cardContainer, {
				[styles.matched]: isMatched,
				[styles.disabled]: isDisabled && !isFlipped,
			})}
		>
			<div
				onClick={() => flipCard(id, true)}
				className={clsx(styles.card, { [styles.flipped]: isFlipped })}
			>
				<div className={clsx(styles.cardFront, styles.fadeIn)}></div>
				<div className={styles.cardBack}>
					<img className={styles.backIcon} src={sourceImg} alt="icon of a card"/>
				</div>
			</div>
		</div>
	);
}
