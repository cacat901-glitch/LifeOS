// Touch emulation, isolated API fixtures; no account or database writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
let browser;
(async()=>{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await context.addCookies([{name:'authjs.session-token',value:'local-visual-fixture-not-a-session',url:'http://localhost:3000'}]);
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/ai/chat'){requests.push(route.request().postDataJSON());await route.fulfill({json:{reply:'A response from the local touch fixture.'}});return;}
    await route.fulfill({json:path==='/api/tasks'?[]:path==='/api/auth/session'?{user:{name:'David'},expires:'2099-01-01'}:path==='/api/notifications'?{notifications:[]}:{} });
  });
  await page.goto('http://localhost:3000/tasks',{waitUntil:'networkidle'});
  const opener=page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Ask Novus'});
  await opener.tap();const dialog=page.getByRole('dialog');await dialog.waitFor();
  assert.equal(await page.evaluate(()=>document.activeElement.tagName),'ASIDE');
  assert.equal(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches),true);
  await page.locator('.intelligence-prompt button').first().tap();await page.getByText('A response from the local touch fixture.').waitFor();
  assert.equal(requests[0].messages.at(-1).content,'Help me prioritize my tasks');
  const input=page.getByRole('textbox',{name:'Ask Novus'});await input.tap();await input.fill('First line');await input.press('Enter');assert.match(await input.inputValue(),/\n/);assert.equal(requests.length,1);
  await input.fill('First line\nSecond line');await page.getByRole('button',{name:'Send',exact:true}).tap();await page.waitForTimeout(500);assert.equal(requests.at(-1).messages.at(-1).content,'First line\nSecond line');
  await page.getByRole('button',{name:'Close Novus'}).tap();await dialog.waitFor({state:'hidden'});assert(await opener.evaluate(el=>el===document.activeElement));
  assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/visual-qa/stage1m-touch-checks.json',JSON.stringify({checks:['True coarse-pointer emulation','No keyboard autofocus on open','Contextual suggestion submits real request shape','Touch Enter inserts newline, send submits','Close restores invocation focus'],errors},null,2));console.log('Touch checks passed');await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
