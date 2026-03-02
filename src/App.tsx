import { Route, Routes } from "react-router";
import NavMenu from "./components/custom/NavMenu";

// Pages
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col justify-start items-center bg-background">
      <div className="flex flex-col items-center w-full m-2">
        <NavMenu />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
