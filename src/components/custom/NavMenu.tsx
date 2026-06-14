import NavButton from "./NavButton";

export default function NavMenu() {
	return (
		<div className="flex flex-col justify-between h-full">
			<div className="flex flex-1 flex-row justify-center items-start mt-4" />
        <div className="flex flex-1 flex-col justify-center items-end mb-4 gap-4 w-25">
          <NavButton text={"Home"} link={"/"} icon={"/icons/Home.svg"} />
          <NavButton text={"Projects"} link={"/Projects"} icon={"/icons/Code.svg"} />
          <NavButton text={"Skills"} link={"/Skills"} icon={"/icons/List.svg"} />
          <NavButton text={"Contact"} link={"/Contact"} icon={"/icons/Mail.svg"} />
          <NavButton text={"Music"} link={"/Music"} icon={"/icons/MusicNote.svg"} />
        </div>
			<div className="flex-1" />
		</div>
	);
}
