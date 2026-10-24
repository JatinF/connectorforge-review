import path from "path";

import { defineConfig, devices } from "@playwright/test";

const apiDir = process.env.CONNECTORFORGE_DIR ?? "F:\\agy\\github\\connectorforge";
const python = process.env.CONNECTORFORGE_PYTHON ?? path.join(apiDir, ".venv", "Scripts", "python.exe");
const apiUrl = "http://127.0.0.1:8765";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `"${python}" -m uvicorn connectorforge.app:create_app --factory --host 127.0.0.1 --port 8765`,
      cwd: apiDir,
      env: {
        ...process.env,
        PYTHONPATH: path.join(apiDir, "src"),
      },
      url: `${apiUrl}/healthz`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "npx next start -p 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        CONNECTORFORGE_API_URL: apiUrl,
      },
    },
  ],
});
