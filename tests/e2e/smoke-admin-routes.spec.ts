/**
 * Smoke regression baseline across every top-level admin route.
 *
 * Goal: detect visual regressions after token/font repair lands. Each test
 * navigates to a route, captures any console errors, and takes a full-page
 * screenshot assertion.
 *
 * Auth handling: most admin routes redirect unauthenticated sessions to /login.
 * That is fine — the point of this baseline is stability, not auth coverage.
 * Whatever URL we land on (route page OR login page) becomes the baseline
 * screenshot for that route id. A real regression will still move the pixels.
 *
 * Baselines are NOT captured in this scaffold step. Run
 * `pnpm test:e2e:update` after the token/font fixes merge.
 */
import { expect, test, type ConsoleMessage } from "@playwright/test";

type RouteSpec = {
  readonly id: string;
  readonly path: string;
};

const ROUTES: readonly RouteSpec[] = [
  { id: "landing", path: "/" },
  { id: "dashboard", path: "/dashboard" },
  { id: "users", path: "/users" },
  { id: "companies", path: "/companies" },
  { id: "roles", path: "/roles" },
  { id: "settings", path: "/settings" },
  { id: "chat", path: "/chat" },
  { id: "connections", path: "/connections" },
  { id: "query", path: "/query" },
  { id: "reports", path: "/reports" },
  { id: "table-access", path: "/table-access" },
];

// Patterns we ignore when collecting console errors. Start empty / strict;
// add entries here only if we see deterministic noise we cannot otherwise fix.
const IGNORED_CONSOLE_PATTERNS: readonly RegExp[] = [
  /Download the React DevTools/i,
  /source[- ]?map/i,
];

function isIgnored(text: string): boolean {
  return IGNORED_CONSOLE_PATTERNS.some((re) => re.test(text));
}

test.describe("smoke: admin routes", () => {
  for (const route of ROUTES) {
    test(`${route.id} (${route.path})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg: ConsoleMessage) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (isIgnored(text)) return;
        consoleErrors.push(text);
      });
      page.on("pageerror", (err) => {
        const text = err.message;
        if (isIgnored(text)) return;
        consoleErrors.push(`[pageerror] ${text}`);
      });

      await page.goto(route.path, { waitUntil: "networkidle" });
      await page.waitForLoadState("networkidle");

      expect(
        consoleErrors,
        `Console errors on ${route.path}:\n${consoleErrors.join("\n")}`
      ).toHaveLength(0);

      await expect(page).toHaveScreenshot(`${route.id}.png`, {
        fullPage: true,
      });
    });
  }
});
