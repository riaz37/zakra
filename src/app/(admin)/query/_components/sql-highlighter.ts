// Lightweight SQL highlighter that emits HTML with .sql-kw / .sql-fn / .sql-str / .sql-num /
// .sql-cmt / .sql-op spans matching the tokens defined in globals.css.

const KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "AS",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "FULL",
  "ON",
  "GROUP BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "HAVING",
  "UNION",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "DISTINCT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "INTO",
  "VALUES",
  "SET",
  "CREATE",
  "TABLE",
  "INDEX",
  "VIEW",
  "WITH",
  "OVER",
  "PARTITION BY",
  "RANK",
  "ROW_NUMBER",
  "DENSE_RANK",
  "BETWEEN",
  "INTERVAL",
  "COALESCE",
  "CAST",
  "TRUE",
  "FALSE",
  "ASC",
  "DESC",
];

const FUNCTIONS = [
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "ARRAY_AGG",
  "JSON_AGG",
  "LOWER",
  "UPPER",
  "TRIM",
  "LENGTH",
  "SUBSTRING",
  "CONCAT",
  "EXTRACT",
  "DATE_TRUNC",
  "TO_CHAR",
  "NOW",
  "CURRENT_DATE",
  "CURRENT_TIMESTAMP",
];

function escape(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function highlightSql(src: string): string {
  const kwRegex = new RegExp(`\\b(${KEYWORDS.join("|")})\\b`, "gi");
  const fnRegex = new RegExp(`\\b(${FUNCTIONS.join("|")})(?=\\s*\\()`, "gi");

  let html = escape(src);
  // comments
  html = html.replace(/(--[^\n]*)/g, '<span class="sql-cmt">$1</span>');
  // strings
  html = html.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '<span class="sql-str">&#39;$1&#39;</span>');
  // numbers
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="sql-num">$1</span>');
  // functions
  html = html.replace(fnRegex, '<span class="sql-fn">$1</span>');
  // keywords
  html = html.replace(kwRegex, '<span class="sql-kw">$1</span>');
  return html;
}
