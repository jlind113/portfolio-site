import { NavLink } from "react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";

import { ModeToggle } from "../mode-toggle";

export default function NavMenu() {
  /*
    Components to add
    Brand Name
    Logo
  */
  return (
    <NavigationMenu className="w-full">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Item one</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>
              <NavLink to={"/Home"} className={"text-foreground"}>
                Home
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <ModeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
