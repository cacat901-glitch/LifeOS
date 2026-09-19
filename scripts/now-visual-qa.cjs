// Browser-only fixture harness. It never writes to a database or changes auth.
// PLAYWRIGHT_MODULE may point at a locally installed Playwright package.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Fixture QA is local-only');
const output = path.resolve('artifacts/visual-qa');
fs.mkdirSync(output, { recursive: true });
const empty = {
  user: { name: 'David', xp: 0, level: 1 },
  habits: { list: [], completed: 0, total: 0, bestStreak: 0 },
  tasks: { list: [], done: 0, total: 0 }, goals: [], mood: null,
  recentWorkout: null, recentJournal: null,
  lifeScore: { total: 0, grade: 'F', breakdown: {} },
  streaks: { habits: 0, journal: 0, workout: 0, mood: 0 },
};
let activeBrowser;
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  activeBrowser = browser;
  const context = await browser.newContext({ viewport: { width: 1672, height: 1050 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  // Middleware's page-shell cookie check only. API data is fulfilled locally;
  // this is not a valid session and must not be used against production.
  await context.addCookies([{ name: 'authjs.session-token', value: 'local-visual-fixture-not-a-session', url: base }]);
  const page = await context.newPage();
  let fixture = structuredClone(empty);
  const mutations = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text()); });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() !== 'GET') mutations.push({ path: url.pathname, body: route.request().postDataJSON() });
    const payload = url.pathname === '/api/dashboard' ? fixture
      : url.pathname === '/api/auth/session' ? { user: { name: 'David', email: 'visual-fixture@example.invalid' }, expires: '2099-01-01' }
      : url.pathname === '/api/ai/briefing' ? { briefing: "You haven't set up any habits yet — that's a powerful place to begin. Today's focus: decide the one thing that would make today a win." }
      : url.pathname === '/api/ai/insights' ? { insights: [] }
      : url.pathname === '/api/notifications' ? { notifications: [] }
      : url.pathname === '/api/ai/chat' ? { reply: 'Local QA response. No real AI request was sent.' }
      : url.pathname === '/api/tasks' ? fixture.tasks.list
      : {};
    await route.fulfill({ json: payload });
  });
  await page.goto(base + '/dashboard', { waitUntil: 'networkidle', timeout: 120000 });
  await page.locator('.now-desktop').waitFor({ timeout: 15000 }).catch(async error => {
    await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
    console.log('page failure', errors, await page.locator('body').innerText());
    await browser.close(); throw error;
  });
  await page.waitForTimeout(2000);
  const name = process.env.QA_CAPTURE || 'iteration';
  await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true });
  const bounds = await page.locator('.now-desktop').boundingBox();
  const geometry = await page.locator('.now-desktop').evaluate(root => {
    const origin = root.getBoundingClientRect();
    return [...root.querySelectorAll('.now-desktop__hero, .metric-instrument, .now-lower-grid > .target-instrument')].map(element => {
      const b = element.getBoundingClientRect();
      return { className: element.className, x: b.x-origin.x, y:b.y-origin.y, width:b.width, height:b.height };
    });
  });
  fs.writeFileSync(path.join(output, name + '.json'), JSON.stringify({ bounds, geometry, viewport: page.viewportSize(), errors }, null, 2));
  console.log(JSON.stringify({ bounds, renderer: await page.locator('.now-desktop .now-liquid-field').getAttribute('data-renderer'), errors }, null, 2));
  if (process.env.QA_MOTION) {
    await page.waitForTimeout(10000);
    await page.screenshot({ path: path.join(output, name + '-10s.png'), fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(500);
    console.log('reduced-motion renderer:', await page.locator('.now-desktop .now-liquid-field').getAttribute('data-renderer'));
    await page.screenshot({ path: path.join(output, name + '-reduced.png'), fullPage: true });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('.now-liquid-field')?.dataset.renderer === 'webgl');
  }
  if (process.env.QA_SUITE) {
    const checks=[];
    await page.getByRole('button', { name: /Choose today's first priority/ }).click();
    const input = page.getByRole('textbox', { name: 'Ask Novus' });
    await input.waitFor();
    assert.equal(await input.inputValue(), "Help me choose today's first priority.");
    await input.press('Enter');
    await page.getByText('Local QA response. No real AI request was sent.').waitFor();
    assert.equal(mutations.at(-1).body.messages.at(-1).content, "Help me choose today's first priority.");
    checks.push('Suggestion prefill and chat request/response contract');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(450);
    fixture = { ...structuredClone(empty),
      tasks: { total: 3, done: 1, list: [
        { id:'qa-task-1', title:'QA fixture: write project brief', status:'TODO', priority:'HIGH' },
        { id:'qa-task-2', title:'QA fixture: review notes', status:'TODO', priority:'MEDIUM' },
        { id:'qa-task-3', title:'QA fixture: completed task', status:'DONE', priority:'LOW' },
      ] },
      habits: { total:2, completed:1, bestStreak:4, list:[
        { id:'qa-habit-1', name:'QA fixture: read', isCompleted:false, streak:3 },
        { id:'qa-habit-2', name:'QA fixture: walk', isCompleted:true, streak:4 },
      ] },
      goals:[{ id:'qa-goal', title:'QA fixture: goal', progress:40 }],
      lifeScore:{ total:43,grade:'C',breakdown:{tasks:33,habits:50,goals:40} }
    };
    await page.reload({ waitUntil:'networkidle' });
    await page.locator('.now-desktop .focus-list button').first().waitFor();
    assert.equal(await page.locator('.now-desktop [aria-label="Task completion"]').getAttribute('aria-valuenow'),'33');
    assert.equal(await page.locator('.now-desktop [aria-label="Overall completion"]').getAttribute('aria-valuenow'),'41');
    await page.screenshot({path:path.join(output,name+'-populated-fixture.png'),fullPage:true});
    await page.locator('.now-desktop .focus-list button').first().click();
    await page.waitForTimeout(250);
    assert.deepEqual(mutations.at(-1), { path:'/api/tasks', body:{taskId:'qa-task-1',status:'DONE'} });
    assert.equal(await page.locator('.now-desktop [aria-label="Task completion"]').getAttribute('aria-valuenow'),'67');
    checks.push('Real-field metric derivation and task PATCH/optimistic state');
    await page.locator('.now-desktop .focus-list button').filter({hasText:'QA fixture: read'}).click();
    await page.waitForTimeout(250);
    assert.deepEqual(mutations.at(-1), { path:'/api/habits', body:{habitId:'qa-habit-1',completed:true} });
    checks.push('Habit PATCH contract');
    await page.evaluate(() => {
      const gl=document.querySelector('.now-liquid-field canvas').getContext('webgl');
      window.qaLossExtension=gl.getExtension('WEBGL_lose_context');
      window.qaLossExtension.loseContext();
    });
    await page.waitForFunction(()=>document.querySelector('.now-liquid-field')?.dataset.renderer==='fallback');
    await page.evaluate(()=>window.qaLossExtension.restoreContext());
    await page.waitForFunction(()=>document.querySelector('.now-liquid-field')?.dataset.renderer==='webgl');
    checks.push('WebGL context-loss fallback and recovery');
    await page.setViewportSize({width:1024,height:900});
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(output,name+'-1024.png'),fullPage:true});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.setViewportSize({width:390,height:844});
    await page.locator('.now-mobile').waitFor();
    await page.screenshot({path:path.join(output,name+'-mobile.png'),fullPage:true});
    assert.equal(await page.locator('.now-desktop .now-liquid-field').getAttribute('data-renderer'),'fallback');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    checks.push('1024px and mobile layout without horizontal overflow; desktop GPU stops on mobile');
    await page.setViewportSize({width:1672,height:1050});
    fixture=structuredClone(empty);await page.reload({waitUntil:'networkidle'});
    await page.getByRole('link',{name:'Add your top three tasks'}).click();
    await page.waitForURL('**/tasks');
    assert.equal(await page.locator('.now-liquid-field').count(),0);
    checks.push('Starter navigation and liquid component unmount');
    fs.writeFileSync(path.join(output,name+'-checks.json'),JSON.stringify({checks,errors},null,2));
    console.log({checks,errors});
    assert.equal(errors.filter(e=>!e.includes('CONTEXT_LOST_WEBGL')).length,0);
  }
  await browser.close();
})().catch(async error => { console.error(error); await activeBrowser?.close(); process.exitCode=1; });
