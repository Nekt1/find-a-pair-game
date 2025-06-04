import clsx from "clsx";
import settings_icon from "../../assets/settings_icon.svg";
import styles from "./styles.module.css"

export default function Settings(props) {
	const {
		toggleSettings,
		isSettingsToggled,
		handleDifficultyChange,
		difficultyOption,
	} = props;
	return (
		<div className={styles.settings}>
			<input
				type="image"
				className={clsx(styles.settingsImg, { [styles.rotate]: isSettingsToggled })}
				src={settings_icon}
				onClick={toggleSettings}
				aria-label="card"
			/>
			<div className={clsx(styles.settingsContent, { [styles.visible]: isSettingsToggled })}>
				<label for="difficultySelector">DIFFICULTY MODE:</label>
				<select
					id="difficultySelector"
					className={styles.difficultySelector}
					value={difficultyOption}
					onChange={handleDifficultyChange}
				>
					<option value="EASY">EASY</option>
					<option value="NORMAL">NORMAL</option>
					<option value="HARD">HARD</option>
				</select>
			</div>
		</div>
	);
}
