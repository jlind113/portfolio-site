import NavButton from "./NavButton";

export default function NavMenu() {
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-1 flex-row justify-center items-start mt-4" />
      <div className="flex flex-1 flex-col justify-center items-center mb-4 gap-4">
        <NavButton link={"/"} icon={"/icons/Home.svg"} />
        <NavButton link={"/Projects"} icon={"/icons/Code.svg"} />
        <NavButton link={"/Skills"} icon={"/icons/List.svg"} />
        <NavButton link={"/Contact"} icon={"/icons/Mail.svg"} />
        <NavButton link={"/Music"} icon={"/icons/MusicNote.svg"} />
      </div>
      <div className="flex-1" />
    </div>
  );
}
