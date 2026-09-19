// Local-only interception; no valid session, production calls or database writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const out='artifacts/visual-qa';
const name=process.env.QA_CAPTURE || 'stage1l';
const base='http://localhost:3000';
const empty={user:{name:'David',xp:0,level:1},habits:{list:[],completed:0,total:0,bestStreak:0},tasks:{list:[],done:0,total:0},goals:[],mood:null,recentWorkout:null,recentJournal:null,lifeScore:{total:0,grade:'F',breakdown:{}},streaks:{habits:0,journal:0,workout:0,mood:0}};
let browser;
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  browser=await chromium.launch({headless:!process.env.QA_HEADED,channel:'chrome'});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,colorScheme:'dark'});
  await context.addCookies([{name:'authjs.session-token',value:'local-visual-fixture-not-a-session',url:base}]);
  const page=await context.newPage();
  let fixture=structuredClone(empty);
  const errors=[],mutations=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  // Count actual shader time progression rather than mistaking a screenshot for motion.
  await page.addInitScript(()=>{
    const names=new WeakMap();
    const get=WebGLRenderingContext.prototype.getUniformLocation;
    WebGLRenderingContext.prototype.getUniformLocation=function(program,name){const result=get.call(this,program,name);if(result)names.set(result,name);return result;};
    const native=WebGLRenderingContext.prototype.uniform1f;
    WebGLRenderingContext.prototype.uniform1f=function(location,value){
      if(location && names.get(location)==='time') window.qaShaderTime=value;
      return native.call(this,location,value);
    };
  });
  await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url());
    if(route.request().method()!=='GET') mutations.push({path:url.pathname,body:route.request().postDataJSON()});
    const body=url.pathname==='/api/dashboard'?fixture:url.pathname==='/api/auth/session'?{user:{name:'David',email:'qa@example.invalid'},expires:'2099-01-01'}:url.pathname==='/api/ai/chat'?{reply:'Local mobile QA response.'}:url.pathname==='/api/ai/briefing'?{briefing:'A clear place to begin.'}:url.pathname==='/api/notifications'?{notifications:[]}:url.pathname==='/api/tasks'?fixture.tasks.list:{};
    await route.fulfill({json:body});
  });
  const capture=async suffix=>page.screenshot({path:`${out}/${name}-${suffix}.png`});
  const load=async()=>{await page.goto(base+'/dashboard',{waitUntil:'networkidle'});await page.locator('.now-mobile').waitFor();await page.waitForTimeout(1200);};
  await load();
  await capture('390');
  await page.screenshot({path:`${out}/${name}-full.png`,fullPage:true});
  await page.locator('.mobile-glance').evaluate(el=>scrollTo(0,el.getBoundingClientRect().top+scrollY-80));await capture('glance');await page.evaluate(()=>scrollTo(0,0));
  if(process.env.QA_QUICK){await browser.close();return;}
  for(const [width,height] of [[360,800],[375,812],[390,844],[393,852],[430,932],[360,640]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(300);await capture(`${width}x${height}`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const box=await page.locator('.mobile-score-card').boundingBox();assert(box.width<=width-30);
    const nav=await page.getByRole('navigation',{name:'Mobile navigation'}).boundingBox();assert(nav.y+nav.height<=height+1);
    for(const b of await page.locator('.bottom-nav--now a,.bottom-nav--now button').all()){const rect=await b.boundingBox();assert(rect.height>=44&&rect.width>=44);}
  }
  checks.push('Six phone sizes, zero page overflow, 44px navigation targets');
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);await capture('reduced');
  assert.equal(await page.locator('.now-mobile .now-liquid-field').getAttribute('data-renderer'),'fallback');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.querySelector('.now-mobile .now-liquid-field').dataset.renderer==='webgl');
  await capture('motion-start');const start=await page.evaluate(()=>window.qaShaderTime);await page.waitForTimeout(10000);await capture('motion-10s');const end=await page.evaluate(()=>window.qaShaderTime);assert(end>start,'Shader clock must advance');console.log({shaderSecondsAdvanced:end-start});
  checks.push('Mobile WebGL, ten-second capture, reduced-motion fallback');
  await page.locator('.mobile-score-card').click();
  const input=page.getByRole('textbox',{name:'Ask Novus'});await input.waitFor();
  assert.match(await input.inputValue(),/Life Score/);await page.getByRole('button',{name:'Send',exact:true}).click();await page.getByText('Local mobile QA response.').waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(350);
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Ask Novus'}).click();await input.waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(350);
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'All spaces'}).click();await page.getByRole('dialog',{name:'All Novus spaces'}).waitFor();await page.getByRole('button',{name:'Close',exact:true}).click();
  checks.push('Score prompt, bottom Novus access and Spaces sheet');
  fixture={...structuredClone(empty),user:{...empty.user,name:'Alexandria-Catherine'},tasks:{total:2,done:0,list:[{id:'t1',title:'Review the complete project proposal and send detailed feedback to the design team',priority:'HIGH',status:'TODO'},{id:'t2',title:'Prepare notes',priority:'MEDIUM',status:'TODO'}]},habits:{total:1,completed:0,bestStreak:4,list:[{id:'h1',name:'Read a chapter and reflect on what I learned',streak:4,isCompleted:false}]},lifeScore:{total:100,grade:'A',breakdown:{}}};
  await load();await capture('populated-long');await page.screenshot({path:`${out}/${name}-populated-full.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  for(const width of [360,375,393,430]) {await page.setViewportSize({width,height:800});await capture(`long-${width}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  await page.setViewportSize({width:390,height:844});
  await page.locator('.mobile-focus-action').click();assert.deepEqual(mutations.at(-1),{path:'/api/tasks',body:{taskId:'t1',status:'DONE'}});
  await page.locator('.mobile-today .focus-list button').filter({hasText:'Read a chapter'}).click();assert.deepEqual(mutations.at(-1),{path:'/api/habits',body:{habitId:'h1',completed:true}});
  assert.equal(await page.locator('.now-mobile [aria-label="Habit completion today, not a weekly history"]').getAttribute('aria-valuenow'),'100');
  await page.locator('.mobile-glance').evaluate(el=>scrollTo(0,el.getBoundingClientRect().top+scrollY-80));await capture('glance-completed');
  checks.push('Long name/title, score 100, real-field task and habit mutation contracts');
  await page.evaluate(()=>document.documentElement.style.setProperty('--safe-bottom','34px'));
  await page.locator('.mobile-deeper-link').scrollIntoViewIfNeeded();await capture('safe-area-bottom');
  const last=await page.locator('.mobile-deeper-link').boundingBox(),nav=await page.locator('.bottom-nav--now').boundingBox();assert(last.y+last.height<=nav.y);
  checks.push('34px bottom safe-area and last action unobscured');
  for(const [hour,greeting,person] of [[9,'Good morning','Li'],[14,'Good afternoon','Alexandria-Catherine'],[20,'Good evening','Éléonore-Marguerite']]) {
    fixture.user.name=person;await page.clock.setFixedTime(new Date(2026,8,19,hour));await load();
    assert.match(await page.locator('.now-mobile__hero h2').innerText(),new RegExp(greeting));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await capture(`greeting-${hour}`);
  }
  checks.push('Morning, afternoon and evening; short, long and accented names');
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Tasks',exact:true}).click();await page.waitForURL('**/tasks');assert.equal(await page.locator('.now-liquid-field').count(),0);
  checks.push('Tasks navigation and liquid unmount');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${name}-checks.json`,JSON.stringify({checks,errors},null,2));console.log({checks,errors});await browser.close();
})().catch(async error=>{console.error(error);await browser?.close();process.exitCode=1;});
