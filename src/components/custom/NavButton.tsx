import { NavLink } from "react-router";
import { Button } from "../ui/button";
import { DarkGrads } from "@/style/gradients";
import { XyzTransition } from "@animxyz/react";
import { useState } from "react";

interface props {
  text: string,
  link: string,
  icon: string,
}

export default function NavButton({text, link, icon}: props) {
  const iconSrc = `${import.meta.env.BASE_URL}${icon.replace(/^\/+/, "")}`;
  const [isHovering, setIsHovering] = useState(false);

  function HandleHover(value: boolean) {
    setIsHovering(value);
  }

    return (
        <XyzTransition appear xyz="fade down back flip-up-25% origin-bottom duration-20 ease-out-back">
            <Button
              asChild
              variant={"secondary"}
              onMouseEnter={() => HandleHover(true)}
              onMouseLeave={() => HandleHover(false)}
              className={`size-14 border-2 border-slate-600 rounded-full ${DarkGrads.grays.gray3}`}
              style={{
                width: isHovering? "100px" : "56px"
              }}
            >
              <NavLink to={link}>
                <XyzTransition xyz={`fade up-100% out-down-0% in-delay-1 out-delay-0 xyz-absolute`}>
                  {!isHovering && <img src={iconSrc} rel="icon" className="size-5" style={{position: "absolute"}} />}
                </XyzTransition>
                <XyzTransition xyz={`fade down-100% out-up-0% in-delay-1 out-delay-0 xyz-absolute`}>
                  {isHovering && <p style={{position: "absolute", textAlign: "center", fontSize: "1.2em"}}>{text}</p>}
                </XyzTransition>
              </NavLink>
            </Button>
        </XyzTransition>
    )
}
