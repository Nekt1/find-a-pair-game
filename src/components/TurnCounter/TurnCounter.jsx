import styles from './styles.module.css'

export default function TurnCounter(props) {
	return <div className={styles.turnCounter}>TURNS: {props.turnsLeft}</div>;
}
