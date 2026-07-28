"use client";

import { createContext, useContext } from "react";

export type NavTarget = "home" | "company" | "menu" | "order" | string;

export const NavContext = createContext<{
  navigate: (target: NavTarget) => void;
  currentView: "home" | "company" | "menu" | "order";
}>({
  navigate: () => {},
  currentView: "home",
});

export function useNav() {
  return useContext(NavContext);
}
