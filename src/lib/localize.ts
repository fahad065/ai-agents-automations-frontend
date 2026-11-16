// Bilingual content stores Arabic in a `<field>_ar` sibling (see CLAUDE.md
// "Bilingual architecture"). Returns the Arabic value when the visitor is in
// Arabic and one exists, otherwise the English value.
export function loc<T extends Record<string, any>>(item: T, key: keyof T & string, isAr: boolean): string {
  const ar = item[`${key}_ar`];
  return isAr && ar ? ar : item[key];
}
