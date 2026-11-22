import NavButton from "./NavButton";

export default function NavMenu() {
	return (
		<div className="flex flex-1 flex-row justify-center items-center gap-4 w-full">
			<NavButton text={"Home"} link={"/"} icon={"/icons/Home.svg"} />
			<NavButton
				text={"Projects"}
				link={"/Projects"}
				icon={"/icons/Code.svg"}
			/>
			<NavButton
				text={"Skills"}
				link={"/Skills"}
				icon={"/icons/List.svg"}
			/>
			<NavButton
				text={"Contact"}
				link={"/Contact"}
				icon={"/icons/Mail.svg"}
			/>
			<NavButton
				text={"Music"}
				link={"/Music"}
				icon={"/icons/MusicNote.svg"}
			/>
			<NavButton
				text={"Sudoku"}
				link={"/Sudoku"}
				icon={"/icons/Sudoku.svg"}
			/>
		</div>
	);
}
