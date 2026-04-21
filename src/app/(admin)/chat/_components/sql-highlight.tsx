import { Fragment } from "react";

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS", "NULL",
  "GROUP", "BY", "ORDER", "LIMIT", "OFFSET", "HAVING", "JOIN", "LEFT",
  "RIGHT", "INNER", "OUTER", "FULL", "ON", "AS", "DISTINCT", "UNION",
  "ALL", "INSERT", "UPDATE", "DELETE", "INTO", "VALUES", "SET", "WITH",
  "CASE", "WHEN", "THEN", "ELSE", "END", "CREATE", "TABLE", "INDEX",
  "VIEW", "DROP", "ALTER", "ADD", "COLUMN", "PRIMARY", "KEY", "FOREIGN",
  "REFERENCES", "CONSTRAINT", "UNIQUE", "DEFAULT", "CHECK", "TRUE", "FALSE",
  "BETWEEN", "LIKE", "ILIKE", "EXISTS", "ANY", "SOME", "ASC", "DESC",
  "INTERVAL", "INT", "INTEGER", "TEXT", "VARCHAR", "BOOLEAN", "TIMESTAMP",
  "DATE", "NUMERIC", "DECIMAL", "CAST", "OVER", "PARTITION", "ROWS",
  "RANGE", "UNBOUNDED", "PRECEDING", "FOLLOWING", "CURRENT", "ROW",
]);

const SQL_FUNCTIONS = new Set([
  "COUNT", "SUM", "AVG", "MIN", "MAX", "DATE_TRUNC", "NOW", "CURRENT_DATE",
  "CURRENT_TIMESTAMP", "EXTRACT", "COALESCE", "NULLIF", "GREATEST", "LEAST",
  "ROW_NUMBER", "RANK", "DENSE_RANK", "LAG", "LEAD", "FIRST_VALUE",
  "LAST_VALUE", "SUBSTRING", "TRIM", "UPPER", "LOWER", "LENGTH", "CONCAT",
  "TO_CHAR", "TO_DATE", "TO_TIMESTAMP", "ROUND", "FLOOR", "CEIL", "ABS",
  "AGE", "GENERATE_SERIES",
]);

interface Token {
  kind: "kw" | "fn" | "str" | "num" | "cmt" | "op" | "plain";
  text: string;
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = sql.length;

  while (i < len) {
    const ch = sql[i];

    // Comment (-- to end of line)
    if (ch === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? len : end;
      tokens.push({ kind: "cmt", text: sql.slice(i, stop) });
      i = stop;
      continue;
    }

    // String literal
    if (ch === "'") {
      let j = i + 1;
      while (j < len) {
        if (sql[j] === "'" && sql[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (sql[j] === "'") {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ kind: "str", text: sql.slice(i, j) });
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < len && /[0-9.]/.test(sql[j])) j += 1;
      tokens.push({ kind: "num", text: sql.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier / keyword / function
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < len && /[A-Za-z0-9_]/.test(sql[j])) j += 1;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();
      // If followed by '(' it's likely a function call
      let k = j;
      while (k < len && sql[k] === " ") k += 1;
      const looksLikeFn = sql[k] === "(";
      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ kind: "kw", text: word });
      } else if (SQL_FUNCTIONS.has(upper) || looksLikeFn) {
        tokens.push({ kind: looksLikeFn ? "fn" : "plain", text: word });
      } else {
        tokens.push({ kind: "plain", text: word });
      }
      i = j;
      continue;
    }

    // Operators
    if ("=<>!+-*/%|&".includes(ch)) {
      let j = i + 1;
      while (j < len && "=<>!+-*/%|&".includes(sql[j])) j += 1;
      tokens.push({ kind: "op", text: sql.slice(i, j) });
      i = j;
      continue;
    }

    // Whitespace / punctuation — pass through
    tokens.push({ kind: "plain", text: ch });
    i += 1;
  }

  return tokens;
}

interface HighlightedSqlProps {
  sql: string;
}

export function HighlightedSql({ sql }: HighlightedSqlProps) {
  const tokens = tokenize(sql);
  return (
    <>
      {tokens.map((t, idx) => {
        if (t.kind === "kw") return <span key={idx} className="sql-kw">{t.text}</span>;
        if (t.kind === "fn") return <span key={idx} className="sql-fn">{t.text}</span>;
        if (t.kind === "str") return <span key={idx} className="sql-str">{t.text}</span>;
        if (t.kind === "num") return <span key={idx} className="sql-num">{t.text}</span>;
        if (t.kind === "cmt") return <span key={idx} className="sql-cmt">{t.text}</span>;
        if (t.kind === "op") return <span key={idx} className="sql-op">{t.text}</span>;
        return <Fragment key={idx}>{t.text}</Fragment>;
      })}
    </>
  );
}

