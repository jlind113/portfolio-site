import { NavLink } from "react-router";
import { Button } from "../ui/button";
import { darkMode } from "@/style/gradients";
import { XyzTransition } from "@animxyz/react";

interface props {
    link: string,
    icon: string,
}

export default function NavButton({link, icon}: props) {
    return (
        <XyzTransition appear xyz="fade down back flip-up-25% origin-bottom duration-20 ease-out-back">
          <Button
            asChild
            variant={"secondary"}
            className={`size-14 border border-slate-600 rounded-full ${darkMode.grays.gray2} hover:scale-110`}
          >
            <NavLink to={link}>
              <img src={icon} rel="icon" className="size-10" />
            </NavLink>
          </Button>
        </XyzTransition>
    )
}