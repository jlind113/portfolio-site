import { Route, Routes } from "react-router";

// Components
import NavMenu from "./components/custom/NavMenu";

// Pages
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Contact from "./pages/Contact";
import Music from "./pages/Music";
import Sudoku from "./pages/Sudoku";

export default function App() {
	return (
		<div className="flex flex-col items-center bg-[#28364B] min-h-screen">
			<div className="flex flex-row items-center mt-4">
				<NavMenu />
			</div>
			<div className="w-full h-full flex flex-col justify-center">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/Projects" element={<Projects />} />
					<Route path="/Skills" element={<Skills />} />
					<Route path="/Contact" element={<Contact />} />
					<Route path="/Music" element={<Music />} />
					<Route path="/Sudoku" element={<Sudoku />}/>
				</Routes>
			</div>
		</div>
	);
}
