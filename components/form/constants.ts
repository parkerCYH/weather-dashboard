export const SEARCH_MODE_KEYS = ["dropdown", "search"] as const;
export type SearchMode = typeof SEARCH_MODE_KEYS[number];
