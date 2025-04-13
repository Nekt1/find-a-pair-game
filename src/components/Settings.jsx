import clsx from "clsx"
import settings_icon from '../assets/settings_icon.svg'

export default function Settings(props) {
    const {toggleSettings, isSettingsToggled, handleDifficultyChange, difficultyOption} = props;
    return (
        <div className="settings">
            <input type="image" className={clsx("settings-img", {"rotate" : isSettingsToggled})} src={settings_icon} onClick={toggleSettings}/>
            <div className={clsx("settings-content", {"visible": isSettingsToggled})}>
                <label>DIFFICULTY MODE:</label>
                <select className="difficulty-selector" value={difficultyOption} onChange={handleDifficultyChange}>
                    <option value="EASY">EASY</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HARD">HARD</option>
                </select>
            </div>
        </div>
    )
}