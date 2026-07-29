"use client";

import { createContext, useContext } from "react";

export type NavTarget = "home" | "company" | "menu" | "order" | "franchise" | "catering" | string;

export const NavContext = createContext<{
  navigate: (target: NavTarget) => void;
  currentView: "home" | "company" | "menu" | "order" | "franchise" | "catering";
}>({
  navigate: () => {},
  currentView: "home",
});

export function useNav() {
  return useContext(NavContext);
}
