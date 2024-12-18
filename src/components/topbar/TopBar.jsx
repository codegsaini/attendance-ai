import { NavLink } from "react-router-dom";
import style from "./style.module.scss";

const TopBar = ({setShowNewCameraForm}) => {
	return (
		<div className={style["container"]}>
			<nav>
				<ul>
					<NavItem to={"/cameras"} title={"Cameras"} />
					<NavItem to={"/management"} title={"Management"} />
					<NavItem to={"/about"} title={"About"} />
					<button onClick={() => setShowNewCameraForm(true)}>Add Camera</button>
				</ul>
			</nav>
		</div>
	);
};

const NavItem = ({ to, title }) => {
	return (
		<li>
			<NavLink
				className={({ isActive }) =>
					!isActive ? style["nav"] : [style["nav"], style["active"]].join(" ")
				}
				to={to}
			>
				{title}
			</NavLink>
		</li>
	);
};

export default TopBar;
