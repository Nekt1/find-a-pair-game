import styles from './styles.module.css'

export default function Timer(props) {
	return <div className={styles.timer}>TIME: {props.timeLeft}</div>;
}
