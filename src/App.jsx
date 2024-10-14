import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import TopBar from "./components/topbar/TopBar";
import style from "./style.module.scss";
import Cameras from "./components/content/cameras/Cameras";
import About from "./components/content/about/About";

const App = () => {
	return (
		<div className={style["container"]}>
			<Header />
			<TopBar />
			<Routes>
				<Route path="/cameras" index element={<Cameras />} />
				<Route path="/management" index element={<Cameras />} />
				<Route path="/about" index element={<About />} />
				<Route path="*" index element={<Navigate to={"/cameras"} />} />
			</Routes>
		</div>
	);
};

export default App;
