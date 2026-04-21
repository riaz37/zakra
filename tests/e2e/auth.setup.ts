/**
 * Playwright auth setup.
 *
 * Logs in via the API once, persists tokens into a storageState file used by
 * the chromium project. Tests then start authenticated without going through
 * the login UI per spec.
 *
 * Reads creds from process.env (loaded via dotenv in playwright.config.ts):
 *   E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
 *
 * Reads the API base URL from NEXT_PUBLIC_API_BASE_URL (same env Next reads).
 */
import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const STORAGE_STATE = path.join(__dirname, "../../.auth/admin.json");

setup("authenticate as admin", async ({ request, page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  expect(email, "E2E_ADMIN_EMAIL must be set in .env.local").toBeTruthy();
  expect(password, "E2E_ADMIN_PASSWORD must be set in .env.local").toBeTruthy();
  expect(apiBase, "NEXT_PUBLIC_API_BASE_URL must be set").toBeTruthy();

  const response = await request.post(`${apiBase}/auth/login`, {
    data: { email, password },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  expect(response.ok(), `login failed: ${response.status()}`).toBeTruthy();

  const body = (await response.json()) as {
    access_token: string;
    refresh_token: string;
  };

  expect(body.access_token).toBeTruthy();
  expect(body.refresh_token).toBeTruthy();

  // Inject tokens into localStorage on the app origin.
  await page.goto("/");
  await page.evaluate(
    ({ access, refresh }) => {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
    },
    { access: body.access_token, refresh: body.refresh_token }
  );

  await page.context().storageState({ path: STORAGE_STATE });
});
