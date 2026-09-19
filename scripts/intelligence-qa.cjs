// Local interception only. Never submit fixture actions to a real account.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const base=process.env.QA_BASE_URL || 'http://localhost:3000',out='artifacts/visual-qa',prefix=process.env.QA_CAPTURE || 'stage1m';
let browser, page;
const fixture={user:{name:'David',xp:0,level:1},habits:{list:[],completed:0,total:0,bestStreak:0},tasks:{list:[],done:0,total:0},goals:[],mood:null,recentWorkout:null,recentJournal:null,lifeScore:{total:0,grade:'F',breakdown:{}},streaks:{habits:0,journal:0,workout:0,mood:0}};
(async()=>{
  fs.mkdirSync(out,{recursive:true});browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,colorScheme:'dark'});
  await context.addCookies([{name:'authjs.session-token',value:'local-visual-fixture-not-a-session',url:base}]);
  page=await context.newPage();const errors=[],requests=[],checks=[];let response={reply:'Your next step is to choose one priority.'},status=200,delay=250;
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('503 (Service Unavailable)'))errors.push(m.text());});
  await page.addInitScript(()=>{const names=new WeakMap(),get=WebGLRenderingContext.prototype.getUniformLocation,native=WebGLRenderingContext.prototype.uniform1f;WebGLRenderingContext.prototype.getUniformLocation=function(p,n){const r=get.call(this,p,n);if(r)names.set(r,n);return r;};WebGLRenderingContext.prototype.uniform1f=function(l,v){if(names.get(l)==='time')window.qaShaderTime=v;return native.call(this,l,v);};});
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/ai/chat'&&route.request().method()==='POST'){requests.push(route.request().postDataJSON());const reply=structuredClone(response),code=status;await new Promise(r=>setTimeout(r,delay));await route.fulfill({status:code,json:reply});return;}
    await route.fulfill({json:path==='/api/dashboard'?fixture:path==='/api/auth/session'?{user:{name:'David',email:'qa@example.invalid'},expires:'2099-01-01'}:path==='/api/ai/briefing'?{briefing:'A clear place to begin.'}:path==='/api/notifications'?{notifications:[]}:path==='/api/tasks'?[]:{} });
  });
  const capture=async suffix=>page.screenshot({path:`${out}/${prefix}-${suffix}.png`});
  const load=async()=>{await page.goto(base+'/dashboard',{waitUntil:'networkidle'});await page.locator('.now-mobile').waitFor({state:'attached'});await page.waitForTimeout(1200);};
  const open=async()=>{await page.keyboard.press('Control+j');await page.getByRole('dialog').waitFor();await page.waitForTimeout(500);};
  await load();await capture('now-desktop');await open();await capture('desktop-idle');
  if(process.env.QA_BEFORE){await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});await load();await capture('now-mobile');await open();await capture('mobile-idle');await browser.close();return;}
  const panel=page.locator('.intelligence-surface'),input=page.getByRole('textbox',{name:'Ask Novus'}),send=page.getByRole('button',{name:'Send',exact:true});
  const overflow=async()=>assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth),'No surface overflow');
  await input.fill('A thoughtful question\nwith a second line.');await capture('desktop-focus');assert.equal(await panel.getAttribute('data-state'),'focused');
  await input.press('Shift+Enter');assert((await input.inputValue()).includes('\n'));
  await input.fill('');await page.getByRole('button',{name:'Close Novus'}).focus();
  const start=await page.evaluate(()=>window.qaShaderTime);await capture('motion-start');await page.waitForTimeout(10000);await capture('motion-10s');assert((await page.evaluate(()=>window.qaShaderTime))>start);
  assert.equal(await page.locator('.now-desktop .now-liquid-field').getAttribute('data-renderer'),'fallback');
  response={reply:'## A clear next step\n\nStart with **one meaningful priority**, then leave room for the rest.\n\n- Review your commitments.\n- Choose the smallest useful action.\n\n### Make it practical\n\n'+('Keep the plan grounded in what you can actually do today. Reflect and adjust as you go.\n\n').repeat(8)+'| Area | Next step |\n| --- | --- |\n| Focus | Choose a priority |\n| Rhythm | Leave room for rest |\n\n```text\n'+('a_long_line_'.repeat(30))+'\n```\n\n[Unsafe](javascript:alert(1))\n\n<script>alert(1)</script>'};delay=1800;
  await input.fill('Help me make a plan');await send.click();await page.locator('.intelligence-status').waitFor();await capture('desktop-thinking');
  await page.locator('.intelligence-prose h2').first().waitFor();await page.waitForTimeout(500);await capture('desktop-long-bottom');await overflow();
  assert.equal(await page.locator('.intelligence-prose script').count(),0);assert.equal(await page.locator('.intelligence-prose a[href^="javascript:"]').count(),0);
  await page.locator('.intelligence-body').evaluate(el=>el.scrollTop=0);await capture('desktop-response');
  checks.push('Desktop idle, focus, multiline, ten-second WebGL, Now loop suspended, structured long response, safe Markdown');
  response={reply:'Please review the change before I continue.',requiresConfirmation:true,pendingActions:[{type:'delete_task',id:'fixture-task'}],confirmationSummary:['Delete the task “Review proposal”']};delay=500;
  await input.fill('Delete my review task');await send.click();await page.getByRole('button',{name:'Confirm action'}).waitFor();await capture('desktop-confirm');
  const beforeCancel=requests.length;await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(requests.length,beforeCancel);await page.getByText('Cancelled. Nothing was changed.').waitFor();
  await input.fill('Delete my review task');await send.click();await page.getByRole('button',{name:'Confirm action'}).waitFor();
  response={reply:'The requested action is complete.',executed:true,results:[{type:'delete_task',ok:true,summary:'Deleted “Review proposal”.'}]};delay=1600;
  await page.getByRole('button',{name:'Confirm action'}).click();await capture('desktop-executing');assert.equal(await panel.getAttribute('data-state'),'executing');await page.getByText('Deleted “Review proposal”.',{exact:true}).waitFor();await capture('desktop-success');assert.deepEqual(requests.at(-1),{confirmActions:[{type:'delete_task',id:'fixture-task'}]});
  response={reply:'The task could not be changed.',executed:true,results:[{type:'create_task',ok:false,summary:'Task creation failed.'}]};delay=300;await input.fill('Create a task');await send.click();await page.getByText('Task creation failed.').waitFor();await capture('desktop-action-failed');
  status=503;response={error:'Unavailable'};await input.fill('Help me plan');await send.click();await page.getByRole('alert').waitFor();await capture('desktop-error');await page.getByRole('button',{name:'Review request and retry'}).click();assert.equal(await input.inputValue(),'Help me plan');status=200;
  checks.push('Confirmation, cancel without mutation, executing, exact confirmation payload, explicit success/failure, HTTP error review retry');
  await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await page.locator('.now-desktop .now-liquid-field').getAttribute('data-renderer'),'webgl');
  for(const [width,height] of [[360,800],[390,844],[430,932]]){
    await page.setViewportSize({width,height});await load();await capture(`now-${width}`);await open();await capture(`mobile-${width}`);await overflow();
    const b=await panel.boundingBox();assert.equal(Math.round(b.width),width);
    const composer=await page.locator('.intelligence-composer').boundingBox();assert(composer.y+composer.height<=height+1);
  }
  await page.setViewportSize({width:390,height:844});await load();await open();
  await page.evaluate(()=>document.documentElement.style.setProperty('--safe-bottom','34px'));await capture('mobile-safe-area');
  await input.fill('Line one\nLine two\nLine three\nLine four');await page.setViewportSize({width:390,height:480});await page.waitForTimeout(250);await capture('mobile-keyboard-sized');assert((await page.locator('.intelligence-composer').boundingBox()).y<480);
  await page.setViewportSize({width:390,height:844});response={reply:'## Your plan\n\n'+('A useful response stays readable across a longer conversation.\n\n').repeat(15)};delay=1600;await send.click();await capture('mobile-thinking');await page.locator('.intelligence-prose h2').waitFor();await capture('mobile-long');await overflow();
  response={reply:'Confirm this change.',requiresConfirmation:true,pendingActions:[{type:'delete_task',id:'fixture-task'}],confirmationSummary:['Delete “Review proposal”']};await input.fill('Delete the task');await send.click();await page.getByRole('button',{name:'Confirm action'}).waitFor();await capture('mobile-confirm');await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.intelligence-liquid .now-liquid-field')?.dataset.renderer==='fallback');await capture('mobile-reduced');await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'Close Novus'}).focus();await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('[role="dialog"]')));
  await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.goto(base+'/tasks',{waitUntil:'networkidle'});await page.waitForTimeout(1000);await open();assert.match(await page.locator('.intelligence-context').innerText(),/Tasks/);await capture('tasks-context');
  checks.push('Three mobile widths, safe areas, keyboard-sized viewport, long response, confirmation, reduced motion, focus trap, close, secondary Space context');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${prefix}-checks.json`,JSON.stringify({checks,errors,requestCount:requests.length},null,2));console.log({checks,errors});await browser.close();
})().catch(async e=>{console.error(e);await page?.screenshot({path:`${out}/${prefix}-failure.png`});console.log(await page?.locator('body').innerText());await browser?.close();process.exitCode=1;});
