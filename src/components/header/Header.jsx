import style from "./style.module.scss";

const Header = () => {
	return (
		<div className={style["container"]}>
			<h1>AttendanceAi</h1>
			<h2> - PCE21CY017</h2>
			<div className={style["guide-container"]}>
				<h2>
					Guide: Mr. Manish Dubey <br />
				</h2>
			</div>
		</div>
	);
};

export default Header;
