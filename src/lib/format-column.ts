/**
 * Format a raw database column name into a human-readable header.
 *
 * Handles three common shapes:
 *   - camelCase / PascalCase  → "contractType"   → "Contract Type"
 *   - ALL_CAPS compound       → "CONTRACTTYPE"   → "Contract Type"
 *   - snake_case / kebab-case → "hiring_year"    → "Hiring Year"
 *
 * For ALL_CAPS compound words, we split on common token boundaries
 * (Type, Year, Count, Id, Date, Name, Code, Status, etc.) so DB-style
 * upper-case identifiers render as proper words.
 */
const COMMON_TOKENS = [
  "Type",
  "Year",
  "Month",
  "Day",
  "Date",
  "Time",
  "Count",
  "Total",
  "Sum",
  "Avg",
  "Min",
  "Max",
  "Id",
  "Name",
  "Code",
  "Status",
  "Department",
  "Employee",
  "Hiring",
  "Contract",
  "Salary",
  "Manager",
  "Group",
  "Number",
  "Amount",
  "Value",
  "Email",
  "Phone",
  "Address",
  "City",
  "Country",
  "Region",
  "Zip",
  "Title",
  "Role",
  "Level",
  "Rate",
  "Score",
  "Rank",
  "Order",
  "Created",
  "Updated",
  "Deleted",
  "Modified",
  "First",
  "Last",
  "Middle",
  "Birth",
  "Gender",
  "Age",
];

function titleCaseWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function splitAllCaps(input: string): string {
  // Greedily split known tokens out of an ALL_CAPS compound word.
  let remaining = input;
  const parts: string[] = [];
  // Sort tokens longest-first so "Department" wins over "Date".
  const tokens = [...COMMON_TOKENS].sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    let matched = false;
    for (const token of tokens) {
      const upper = token.toUpperCase();
      if (remaining.endsWith(upper) && remaining.length > upper.length) {
        const head = remaining.slice(0, remaining.length - upper.length);
        parts.unshift(token);
        remaining = head;
        matched = true;
        break;
      }
    }
    if (!matched) {
      parts.unshift(titleCaseWord(remaining));
      break;
    }
  }
  return parts.join(" ");
}

export function formatColumnHeader(col: string): string {
  if (!col) return col;
  const trimmed = col.trim();

  // snake_case / kebab-case
  if (/[_-]/.test(trimmed)) {
    return trimmed
      .split(/[_-]+/)
      .filter(Boolean)
      .map(titleCaseWord)
      .join(" ");
  }

  // ALL CAPS — try token-aware split, fall back to title case
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    if (trimmed.length <= 3) return trimmed; // keep acronyms (ID, URL, IP)
    const split = splitAllCaps(trimmed);
    if (split && split !== trimmed) return split;
    return titleCaseWord(trimmed);
  }

  // camelCase / PascalCase — split on capital boundaries
  const spaced = trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map(titleCaseWord)
    .join(" ");
}
