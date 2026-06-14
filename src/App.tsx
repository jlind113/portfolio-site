import { Route, Routes } from "react-router";
import NavMenu from "./components/custom/NavMenu";

// Pages
import { DarkGrads } from "./style/gradients";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Contact from "./pages/Contact";
import Music from "./pages/Music";

export default function App() {
	return (
		<div
			className={`flex flex-row justify-between items-start ${DarkGrads.grays.gray1} min-h-screen`}
		>
			<div className="w-full h-full p-10">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/Projects" element={<Projects />} />
					<Route path="/Skills" element={<Skills />} />
					<Route path="/Contact" element={<Contact />} />
					<Route path="/Music" element={<Music />} />
				</Routes>
			</div>
			<div className="flex flex-col items-center my-80 mx-4">
				<NavMenu />
			</div>
		</div>
	);
}
