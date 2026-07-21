export const NAV_ITEMS = [
  { id: "home", label: "Главная", href: "/" },
  { id: "training", label: "Тренировки", href: "/#training" },
  { id: "variants", label: "Варианты", href: "/#variants" },
  { id: "theory", label: "Теория", href: "/#theory" },
  { id: "diagnostic", label: "Диагностика", href: "/diagnostics/grammar" },
] as const;

export function isNavActive(id: string, pathname: string) {
  return {
    home: pathname === "/",
    training: pathname.startsWith("/training"),
    variants: pathname.startsWith("/variants"),
    theory: pathname.startsWith("/theory"),
    diagnostic: pathname.startsWith("/diagnostics"),
  }[id];
}
