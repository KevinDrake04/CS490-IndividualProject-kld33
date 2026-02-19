import { NavLink } from "react-router-dom"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

function NavItem({ to, label, end }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <NavLink
          to={to}
          end={end}
          className={({ isActive }) =>
            `${navigationMenuTriggerStyle()} !text-xl ${isActive ? "font-semibold" : ""
            }`
          }
        >
          {label}
        </NavLink>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative mx-auto flex h-16 max-w-screen-xl items-center px-4">
        {/* Left: logo */}
        <div className="flex items-center">
          <NavLink to="/" className="text-2xl font-semibold">
            Sakila Films: Employee View
          </NavLink>
        </div>

        {/* Center: menu */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavItem to="/" label="Home" end />
              <NavItem to="/films" label="Films" />
              <NavItem to="/customers" label="Customers" />
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}
