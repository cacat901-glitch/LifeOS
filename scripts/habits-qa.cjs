// Local-only browser fixtures. No valid session or production mutation is used.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = process.env.QA_BASE_URL || "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Habit fixture QA is local-only");
const output = path.resolve("artifacts/visual-qa"); fs.mkdirSync(output, { recursive: true });
const initial = [
  { id:"h1", name:"Morning meditation before checking messages", description:"Ten quiet minutes before the day begins.", icon:"🧘", color:"#6366f1", frequency:"DAILY", targetDays:[], currentStreak:8, longestStreak:14, totalCompletions:43, logs:[{completed:true}], category:{name:"Mind"} },
  { id:"h2", name:"Read twenty pages", icon:"📚", color:"#3b82f6", frequency:"DAILY", targetDays:[], currentStreak:4, longestStreak:11, totalCompletions:28, logs:[{completed:false}] },
  { id:"h3", name:"Strength training", icon:"💪", color:"#ef4444", frequency:"WEEKLY", targetDays:[1,3,5], currentStreak:2, longestStreak:6, totalCompletions:19, logs:[] },
  { id:"h4", name:"Plan the month", icon:"📝", color:"#10b981", frequency:"MONTHLY", targetDays:[], currentStreak:0, longestStreak:3, totalCompletions:7, logs:[{completed:true}] },
  { id:"h5", name:"Evening walk with enough detail to verify long habit-name wrapping on narrow screens", icon:"🚶", color:"#f59e0b", frequency:"DAILY", targetDays:[], currentStreak:1, longestStreak:9, totalCompletions:31, logs:[] },
];

let browser;
(async()=>{
  browser=await chromium.launch({headless:true,channel:"chrome"});
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,colorScheme:"dark"});
  await context.addCookies([{name:"authjs.session-token",value:"local-habit-fixture",url:base}]);
  const page=await context.newPage(); let habits=structuredClone(initial); const mutations=[]; const errors=[];
  page.on("pageerror",e=>errors.push(e.message)); page.on("console",m=>{if(m.type()==="error")errors.push(m.text());}); page.on("dialog",dialog=>dialog.accept());
  await page.route("**/api/**",async route=>{
    const request=route.request(), url=new URL(request.url()), method=request.method();
    if(url.pathname==="/api/auth/session")return route.fulfill({json:{user:{name:"David",email:"habits-qa@example.invalid"},expires:"2099-01-01"}});
    if(url.pathname==="/api/notifications")return route.fulfill({json:{notifications:[],unreadCount:0}});
    if(url.pathname==="/api/user")return route.fulfill({json:{subscription:{plan:"PRO"}}});
    if(url.pathname==="/api/ai/chat")return route.fulfill({json:{reply:"Local Habits QA response."}});
    if(url.pathname!=="/api/habits")return route.fulfill({json:{}});
    if(method==="GET")return route.fulfill({json:habits});
    const body=request.postDataJSON(); mutations.push({method,body});
    if(method==="POST"){const created={id:`created-${habits.length}`,currentStreak:0,longestStreak:0,totalCompletions:0,targetDays:[],logs:[],...body};habits=[created,...habits];return route.fulfill({status:201,json:created});}
    if(method==="PATCH"){habits=habits.map(h=>h.id===body.habitId?{...h,logs:[{completed:body.completed}]}:h);return route.fulfill({json:{completed:body.completed}});}
    if(method==="DELETE"){habits=habits.filter(h=>h.id!==body.habitId);return route.fulfill({json:{message:"Habit deleted"}});}
  });
  const capture=(name,fullPage=true)=>page.screenshot({path:path.join(output,`stage2b-${name}.png`),fullPage});
  await page.goto(`${base}/habits`,{waitUntil:"networkidle",timeout:120000}); await page.getByRole("heading",{name:"Your rhythm"}).waitFor();
  await capture("desktop-populated"); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true); assert.equal(await page.getByRole("checkbox").count(),5); assert.equal(await page.getByText("2/5").count(),1); assert.equal(await page.getByText("14d").count(),1);
  await page.getByRole("checkbox",{name:/Complete: Read twenty/}).click(); assert.deepEqual(mutations.at(-1),{method:"PATCH",body:{habitId:"h2",completed:true}}); await page.getByRole("checkbox",{name:/Mark incomplete: Read twenty/}).click(); assert.deepEqual(mutations.at(-1),{method:"PATCH",body:{habitId:"h2",completed:false}});
  await page.getByRole("button",{name:"New habit",exact:true}).click(); await page.getByRole("dialog",{name:"New habit"}).waitFor(); await page.getByLabel("Habit name").fill("Weekly reflection"); await page.getByRole("button",{name:"Use 📝 icon"}).click(); await page.getByRole("button",{name:"Weekly",exact:true}).click(); await page.getByRole("button",{name:"Create habit",exact:true}).click(); await page.getByText("Weekly reflection").waitFor(); assert.equal(mutations.at(-1).body.frequency,"WEEKLY"); assert.equal(mutations.at(-1).body.icon,"📝");
  await page.getByRole("button",{name:"Delete Weekly reflection"}).click(); await page.waitForTimeout(100); assert.equal(await page.getByText("Weekly reflection").count(),0); assert.equal(mutations.at(-1).method,"DELETE");
  await page.getByRole("button",{name:"New habit",exact:true}).click(); await page.getByRole("button",{name:"Close new habit form"}).click(); assert.equal(await page.getByRole("dialog",{name:"New habit"}).count(),0); await page.getByRole("button",{name:"New habit",exact:true}).click(); await page.keyboard.press("Escape"); assert.equal(await page.getByRole("dialog",{name:"New habit"}).count(),0);
  for(let i=0;i<14;i++)habits.push({id:`bulk-${i}`,name:`Recurring practice ${i+1} with a clear descriptive name`,icon:"•",color:"#6366f1",frequency:i%2?"WEEKLY":"DAILY",targetDays:i%2?[2,4]:[],currentStreak:i%5,longestStreak:i%8,totalCompletions:i*2,logs:i%3===0?[{completed:true}]:[]});
  await page.reload({waitUntil:"networkidle"}); await page.getByRole("heading",{name:"Your rhythm"}).waitFor(); await capture("desktop-many",false);
  for(const [width,height] of [[1024,850],[360,800],[390,844],[430,932]]){await page.setViewportSize({width,height});await page.waitForTimeout(250);await capture(`${width}x${height}`,false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(width<1024){const nav=await page.getByRole("navigation",{name:"Mobile navigation"}).boundingBox();assert(nav&&nav.y+nav.height<=height+1);}}
  habits=[]; await page.setViewportSize({width:390,height:844}); await page.reload({waitUntil:"networkidle"}); await page.getByText("No habits yet").waitFor(); await capture("mobile-empty"); assert.equal(await page.getByText("0/0").count(),1); await page.emulateMedia({reducedMotion:"reduce"}); await page.waitForTimeout(100); await capture("mobile-reduced"); assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector("main > div > div")).animationName==="none"),true);

  habits=[structuredClone(initial[0]),structuredClone(initial[4])];
  const touch=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"dark",isMobile:true,hasTouch:true}); await touch.addCookies([{name:"authjs.session-token",value:"local-habit-touch",url:base}]); const touchPage=await touch.newPage(); touchPage.on("pageerror",e=>errors.push(e.message)); touchPage.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await touchPage.route("**/api/**",async route=>{const request=route.request(),url=new URL(request.url());if(url.pathname==="/api/auth/session")return route.fulfill({json:{user:{name:"David"},expires:"2099-01-01"}});if(url.pathname==="/api/notifications")return route.fulfill({json:{notifications:[]}});if(url.pathname==="/api/user")return route.fulfill({json:{subscription:{plan:"PRO"}}});if(url.pathname==="/api/habits"&&request.method()==="GET")return route.fulfill({json:habits});if(url.pathname==="/api/habits"&&request.method()==="PATCH"){const body=request.postDataJSON();habits=habits.map(h=>h.id===body.habitId?{...h,logs:[{completed:body.completed}]}:h);return route.fulfill({json:{completed:body.completed}});}return route.fulfill({json:{}});});
  await touchPage.goto(`${base}/habits`,{waitUntil:"networkidle",timeout:120000});await touchPage.getByRole("heading",{name:"Your rhythm"}).waitFor();await touchPage.getByRole("checkbox",{name:/Complete: Evening walk/}).tap();await touchPage.getByRole("checkbox",{name:/Mark incomplete: Evening walk/}).waitFor();await touchPage.getByRole("button",{name:"New habit",exact:true}).tap();await touchPage.getByRole("dialog",{name:"New habit"}).waitFor();await touchPage.waitForTimeout(450);assert.equal(await touchPage.evaluate(()=>{const dialog=document.querySelector('[role="dialog"]');const layer=dialog?.parentElement?.parentElement;const nav=document.querySelector('[aria-label="Mobile navigation"]');return Number(getComputedStyle(layer).zIndex)>Number(getComputedStyle(nav).zIndex)}),true);await touchPage.screenshot({path:path.join(output,"stage2b-mobile-dialog.png"),fullPage:false});await touchPage.getByRole("button",{name:"Close new habit form"}).tap();const nav=await touchPage.getByRole("navigation",{name:"Mobile navigation"}).boundingBox();assert(nav&&nav.y+nav.height<=845);assert.equal(await touchPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await touch.close();
  assert.deepEqual(errors,[]); fs.writeFileSync(path.join(output,"stage2b-habits-checks.json"),JSON.stringify({checks:["desktop populated and dense","truthful today and streak values","complete/uncomplete contract","create frequency and icon","delete and dialog dismissal","1024 and three phone widths","empty and reduced motion","touch and mobile dialog","no overflow or console errors"],mutations,errors},null,2)); console.log({checks:9,mutations:mutations.length,errors}); await browser.close();
})().catch(async error=>{console.error(error);await browser?.close();process.exitCode=1;});
