import { expect, test } from "@playwright/test";

for (const width of [375, 430, 768, 1024, 1440]) {
  test(`phone and controls fit at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?preview=1");
    const call = page.getByRole("button", { name: "0 — Call Operator" });
    await expect(call).toBeVisible();
    const key = await call.boundingBox();
    expect(key!.width).toBeGreaterThanOrEqual(44);
    expect(key!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/zero-${width}.png`, fullPage: true });
    await call.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toHaveText("Connected");
    await expect(page.getByRole("button", { name: "End call" })).toBeVisible();
    await page.getByRole("button", { name: "Mute microphone", exact: true }).click();
    await expect(page.getByRole("button", { name: "Unmute microphone", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Unmute microphone", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/zero-${width}-connected.png`, fullPage: true });
    await page.getByRole("button", { name: "End call" }).click();
    await expect(page.getByRole("heading", { name: "What the AI understood" })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const scenario of ["towels", "water", "wifi"]) {
  test(`scripted ${scenario} summary uses recorded session data and resets on a new call`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/?preview=1&scenario=${scenario}`);
    await page.getByRole("button", { name: "0 — Call Operator" }).click();
    await page.clock.runFor(800);
    await expect(page.getByRole("status")).toHaveText("Connected");
    await page.clock.runFor(4100);
    await page.getByRole("button", { name: "End call" }).click();
    const summary = page.getByRole("region", { name: "What the AI understood" });
    await expect(summary).toContainText(scenario === "wifi" ? "Resolved during call" : scenario === "water" ? "Bottled water" : "Extra towels");
    await page.getByText("Conversation transcript", { exact: false }).click();
    await expect(summary).toContainText(scenario === "wifi" ? "welcometozero" : "Room 110");
    await page.getByRole("button", { name: "0 — Call Operator" }).click();
    await expect(summary).toHaveCount(0);
    await page.getByRole("button", { name: "Cancel call" }).click();
    await expect(page.getByRole("status")).toHaveText("Call ended");
    await expect(page.getByRole("region", { name: "What the AI understood" })).toContainText("No completed service request");
  });
}

test("microphone denial gives an actionable error and never requests a token", async ({ page }) => {
  let tokenRequests = 0;
  page.on("request", request => { if (request.url().includes("elevenlabs-token")) tokenRequests++; });
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("Permission denied", "NotAllowedError"); };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "0 — Call Operator" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Please allow microphone access and try again.");
  expect(tokenRequests).toBe(0);
  await expect(page.getByRole("button", { name: "0 — Call Operator" })).toBeEnabled();
});

test("token failure stops the permission-check microphone and leaves retry available", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { stopped: number }).stopped = 0;
    navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop: () => { (window as unknown as { stopped: number }).stopped++; } }] }) as unknown as MediaStream;
  });
  await page.route("**/api/elevenlabs-token", route => route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "connection failed" }) }));
  await page.goto("/");
  await page.getByRole("button", { name: "0 — Call Operator" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("We couldn’t connect to Guest Services");
  expect(await page.evaluate(() => (window as unknown as { stopped: number }).stopped)).toBeGreaterThanOrEqual(1);
  await expect(page.getByRole("button", { name: "0 — Call Operator" })).toBeEnabled();
  await expect(page.getByRole("region", { name: "What the AI understood" })).toContainText("No completed service request");
});

test("cancel while microphone permission is pending cannot start a late call", async ({ page }) => {
  let tokenRequests = 0;
  page.on("request", request => { if (request.url().includes("elevenlabs-token")) tokenRequests++; });
  await page.addInitScript(() => {
    const state = window as unknown as { stopped: number; releaseMic: () => void };
    state.stopped = 0;
    navigator.mediaDevices.getUserMedia = () => new Promise(resolve => {
      state.releaseMic = () => resolve({ getTracks: () => [{ stop: () => { state.stopped++; } }] } as unknown as MediaStream);
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "0 — Call Operator" }).click();
  await expect(page.getByRole("status")).toHaveText("Connecting…");
  await page.getByRole("button", { name: "Cancel call" }).click();
  await page.evaluate(() => (window as unknown as { releaseMic: () => void }).releaseMic());
  await expect(page.getByRole("status")).toHaveText("Call ended");
  expect(await page.evaluate(() => (window as unknown as { stopped: number }).stopped)).toBeGreaterThanOrEqual(1);
  expect(tokenRequests).toBe(0);
});

test("a stalled connection times out and clears the connecting state", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = () => new Promise(() => {}); });
  await page.goto("/");
  await page.getByRole("button", { name: "0 — Call Operator" }).click();
  await page.clock.runFor(30_100);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("took too long to connect");
  await expect(page.getByRole("button", { name: "0 — Call Operator" })).toBeEnabled();
});
