import type { CatalogPlugin } from "./types";

export function filterPlugins(
  plugins: CatalogPlugin[],
  filters: { category?: string; installed?: string },
): CatalogPlugin[] {
  return plugins.filter((plugin) => {
    if (filters.category && filters.category !== "all" && plugin.category !== filters.category) {
      return false;
    }
    if (filters.installed === "installed" && !plugin.installed) {
      return false;
    }
    if (filters.installed === "available" && plugin.installed) {
      return false;
    }
    return true;
  });
}

export function categoriesOf(plugins: CatalogPlugin[]): string[] {
  return [...new Set(plugins.map((plugin) => plugin.category))].sort();
}
