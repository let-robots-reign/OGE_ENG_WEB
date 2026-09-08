export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "home", label: "Главная", href: "/" },
  { id: "training", label: "Тренировки", href: "/#training" },
  { id: "variants", label: "Варианты", href: "/#variants" },
  { id: "theory", label: "Теория", href: "/#theory" },
  { id: "diagnostic", label: "Диагностика", href: "/diagnostics/grammar" },
];

// Only shown to `teacher`/`admin` — appended by the header when the session role
// allows it.
export const TEACHER_NAV_ITEM: NavItem = {
  id: "classes",
  label: "Классы",
  href: "/teacher",
};

/**
 * Nav items for a given role. `teacher`/`admin` also see the classes cabinet.
 */
export function navItemsForRole(role: string | null | undefined): NavItem[] {
  const items = [...NAV_ITEMS];
  if (role === "teacher" || role === "admin") items.push(TEACHER_NAV_ITEM);
  return items;
}

export function isNavActive(id: string, pathname: string) {
  return {
    home: pathname === "/",
    training: pathname.startsWith("/training"),
    variants: pathname.startsWith("/variants"),
    theory: pathname.startsWith("/theory"),
    diagnostic: pathname.startsWith("/diagnostics"),
    classes: pathname.startsWith("/teacher"),
  }[id];
}
