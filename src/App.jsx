import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import TopBar from "./components/topbar/TopBar";
import style from "./style.module.scss";
import Cameras from "./components/content/cameras/Cameras";
import About from "./components/content/about/About";
import { useState } from "react";

const App = () => {
	const [showNewCameraForm, setShowNewCameraForm] = useState(false);
	return (
		<div className={style["container"]}>
			<Header />
			<TopBar setShowNewCameraForm={setShowNewCameraForm} />
			<Routes>
				<Route path="/cameras" index element={<Cameras showNewCameraForm={showNewCameraForm} setShowNewCameraForm={setShowNewCameraForm} />} />
				<Route path="/management" element={<Cameras showNewCameraForm={showNewCameraForm} setShowNewCameraForm={setShowNewCameraForm} />} />
				<Route path="/about" element={<About />} />
				<Route path="*" element={<Navigate to={"/cameras"} />} />
			</Routes>
		</div>
	);
};

export default App;
