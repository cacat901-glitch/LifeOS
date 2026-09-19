// Local-only browser fixture. It never uses a valid session or writes to production data.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = process.env.QA_BASE_URL || "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Task fixture QA is local-only");
const output = path.resolve("artifacts/visual-qa");
fs.mkdirSync(output, { recursive: true });

const initial = [
  { id: "t1", title: "Review the complete launch plan and resolve the remaining implementation questions", description: "Confirm the final owner for each open decision before the handoff.", priority: "URGENT", status: "TODO", dueDate: "2026-09-18T12:00:00.000Z", category: { name: "Novus" } },
  { id: "t2", title: "Prepare the weekly product notes", priority: "HIGH", status: "IN_PROGRESS", dueDate: "2026-09-19T12:00:00.000Z", category: { name: "Work" } },
  { id: "t3", title: "Send the concise project update", priority: "MEDIUM", status: "TODO", dueDate: "2026-09-25T12:00:00.000Z" },
  { id: "t4", title: "Archive the completed research", priority: "LOW", status: "DONE", dueDate: "2026-09-12T12:00:00.000Z" },
  { id: "t5", title: "Plan the next focused work block", priority: "MEDIUM", status: "DONE" },
];

let browser;
(async () => {
  browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: "dark" });
  await context.addCookies([{ name: "authjs.session-token", value: "local-task-fixture-not-a-session", url: base }]);
  const page = await context.newPage();
  let tasks = structuredClone(initial);
  const mutations = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.clock.setFixedTime(new Date(2026, 8, 19, 12));
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    if (url.pathname === "/api/auth/session") return route.fulfill({ json: { user: { name: "David", email: "tasks-qa@example.invalid" }, expires: "2099-01-01" } });
    if (url.pathname === "/api/notifications") return route.fulfill({ json: { notifications: [], unreadCount: 0 } });
    if (url.pathname === "/api/ai/chat") return route.fulfill({ json: { reply: "Local Tasks QA response." } });
    if (url.pathname !== "/api/tasks") return route.fulfill({ json: {} });
    if (method === "GET") return route.fulfill({ json: tasks });
    const body = request.postDataJSON();
    mutations.push({ method, body });
    if (method === "POST") {
      const created = { id: `created-${tasks.length}`, priority: "MEDIUM", status: "TODO", ...body };
      tasks = [created, ...tasks]; return route.fulfill({ status: 201, json: created });
    }
    if (method === "PATCH") {
      tasks = tasks.map((task) => task.id === body.taskId ? { ...task, ...body } : task);
      return route.fulfill({ json: tasks.find((task) => task.id === body.taskId) });
    }
    if (method === "DELETE") {
      tasks = tasks.filter((task) => task.id !== body.taskId); return route.fulfill({ json: { message: "Task deleted" } });
    }
  });

  const capture = (name, fullPage = true) => page.screenshot({ path: path.join(output, `stage2a-${name}.png`), fullPage });
  await page.goto(`${base}/tasks`, { waitUntil: "networkidle", timeout: 120000 });
  await page.getByRole("heading", { name: "Ready to execute" }).waitFor();
  await capture("desktop-populated");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.getByRole("checkbox").count(), 3);
  assert.equal(await page.getByText("Overdue · Sep 18").count(), 2); // desktop and mobile metadata share one truthful value
  assert.equal(await page.getByText("Due today").count(), 2);

  await page.getByRole("textbox", { name: "Quick add a task" }).fill("Quick QA task");
  await page.getByRole("textbox", { name: "Quick add a task" }).press("Enter");
  await page.getByText("Quick QA task").waitFor();
  assert.deepEqual(mutations.at(-1), { method: "POST", body: { title: "Quick QA task" } });

  await page.getByRole("checkbox", { name: /Complete: Review/ }).click();
  await page.getByRole("button", { name: /Done/ }).click();
  await page.getByText(/Review the complete launch plan/).waitFor();
  assert.deepEqual(mutations.at(-1), { method: "PATCH", body: { taskId: "t1", status: "DONE" } });
  await page.getByRole("checkbox", { name: /Mark incomplete: Review/ }).click();
  assert.deepEqual(mutations.at(-1), { method: "PATCH", body: { taskId: "t1", status: "TODO" } });

  await page.getByRole("button", { name: /Active/ }).click();
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByRole("dialog", { name: "New task" }).waitFor();
  await page.getByLabel("Title *").fill("Detailed QA task");
  await page.getByLabel("Description").fill("Created only in the local fixture.");
  await page.getByRole("button", { name: "high", exact: true }).click();
  await page.getByLabel("Due date").fill("2026-09-27");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await page.getByText("Detailed QA task").waitFor();
  assert.equal(mutations.at(-1).method, "POST");
  assert.equal(mutations.at(-1).body.priority, "HIGH");
  await page.getByRole("button", { name: "Delete Detailed QA task" }).click();
  assert.equal(await page.getByText("Detailed QA task").count(), 0);
  assert.equal(mutations.at(-1).method, "DELETE");

  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByRole("button", { name: "Close new task form" }).click();
  assert.equal(await page.getByRole("dialog", { name: "New task" }).count(), 0);
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog", { name: "New task" }).count(), 0);

  await page.getByRole("button", { name: /Active/ }).click();
  for (let index = 0; index < 18; index += 1) tasks.push({ id: `bulk-${index}`, title: `Additional execution item ${index + 1} with enough detail to verify a dense task queue`, priority: index % 3 === 0 ? "HIGH" : "MEDIUM", status: "TODO", dueDate: "2026-09-29T12:00:00.000Z" });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Ready to execute" }).waitFor();
  await capture("desktop-many");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  for (const [width, height] of [[1024, 850], [360, 800], [390, 844], [430, 932]]) {
    await page.setViewportSize({ width, height }); await page.waitForTimeout(250);
    await capture(`${width}x${height}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (width < 1024) {
      const nav = await page.getByRole("navigation", { name: "Mobile navigation" }).boundingBox();
      assert(nav && nav.y + nav.height <= height + 1);
      for (const control of await page.locator("li button").all()) { const rect = await control.boundingBox(); if (rect) assert(rect.height >= 24); }
    }
  }

  tasks = [];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Nothing is asking for action").waitFor();
  await capture("mobile-empty");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.waitForTimeout(100); await capture("mobile-reduced");
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector("main > div > div")).animationName === "none"), true);

  tasks = [{ id: "touch-task", title: "Touch target verification task with a long mobile title", priority: "HIGH", status: "TODO", dueDate: "2026-09-19T12:00:00.000Z" }];
  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: "dark", isMobile: true, hasTouch: true });
  await touchContext.addCookies([{ name: "authjs.session-token", value: "local-task-fixture-not-a-session", url: base }]);
  const touchPage = await touchContext.newPage();
  touchPage.on("pageerror", (error) => errors.push(error.message));
  touchPage.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await touchPage.route("**/api/**", async (route) => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname === "/api/auth/session") return route.fulfill({ json: { user: { name: "David", email: "tasks-touch@example.invalid" }, expires: "2099-01-01" } });
    if (url.pathname === "/api/notifications") return route.fulfill({ json: { notifications: [], unreadCount: 0 } });
    if (url.pathname === "/api/tasks" && request.method() === "GET") return route.fulfill({ json: tasks });
    if (url.pathname === "/api/tasks" && request.method() === "PATCH") { const body = request.postDataJSON(); tasks = tasks.map((task) => task.id === body.taskId ? { ...task, ...body } : task); return route.fulfill({ json: tasks[0] }); }
    return route.fulfill({ json: {} });
  });
  await touchPage.goto(`${base}/tasks`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await touchPage.getByRole("heading", { name: "Ready to execute" }).waitFor();
  await touchPage.getByRole("checkbox", { name: /Complete:/ }).tap();
  await touchPage.getByRole("button", { name: /Done/ }).tap();
  await touchPage.getByText("Touch target verification task").waitFor();
  await touchPage.getByRole("button", { name: "New task", exact: true }).tap();
  await touchPage.getByRole("dialog", { name: "New task" }).waitFor();
  await touchPage.waitForTimeout(450);
  await touchPage.screenshot({ path: path.join(output, "stage2a-mobile-dialog.png"), fullPage: true });
  await touchPage.getByRole("button", { name: "Close new task form" }).tap();
  await touchPage.evaluate(() => document.documentElement.style.setProperty("--safe-bottom", "24px"));
  const mobileNav = await touchPage.getByRole("navigation", { name: "Mobile navigation" }).boundingBox();
  assert(mobileNav && mobileNav.y + mobileNav.height <= 844 + 1);
  assert.equal(await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await touchContext.close();

  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(output, "stage2a-tasks-checks.json"), JSON.stringify({ checks: ["desktop populated and large list", "quick and detailed creation", "complete and uncomplete", "filters and delete", "dialog close and Escape", "1024 and three phone widths", "empty and reduced motion", "coarse-pointer touch, mobile dialog and safe area", "no overflow or console errors"], mutations, errors }, null, 2));
  console.log({ checks: 9, mutations: mutations.length, errors });
  await browser.close();
})().catch(async (error) => { console.error(error); await browser?.close(); process.exitCode = 1; });
