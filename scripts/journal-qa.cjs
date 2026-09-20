// Local-only browser fixtures. No valid session or production mutation is used.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = process.env.QA_BASE_URL || "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Journal fixture QA is local-only");
const output = path.resolve("artifacts/visual-qa"); fs.mkdirSync(output, { recursive: true });
const longBody = Array.from({ length: 18 }, (_, index) => `Paragraph ${index + 1}. This is a deliberately long reflection used to verify readable line length, paragraph rhythm, and scrolling without placing controls over the written content.`).join("\n\n");
const initial = [
  { id:"j1",title:"What changed when I slowed down",content:longBody,mood:8,moodEmoji:"😄",tags:["reflection","work"],wordCount:396,type:"REFLECTION",date:"2026-09-18T20:14:00.000Z" },
  { id:"j2",title:"Three things worth keeping",content:"A clear morning, an unhurried conversation, and enough time to finish one important piece of work.",mood:9,moodEmoji:"😁",tags:["gratitude"],wordCount:17,type:"GRATITUDE",date:"2026-09-11T07:40:00.000Z" },
  { id:"j3",title:null,content:"I need to leave more room between deciding and reacting. The extra minute changes the quality of the choice.",mood:6,moodEmoji:"🙂",tags:[],wordCount:20,type:"DAILY",date:"2026-08-29T18:05:00.000Z" },
];
const patternResponse = { patterns:{ patterns:[{title:"Reflection follows focused work",description:"Recent records show journaling appears alongside completed priority work.",actionable:"Protect a short reflection window after focused sessions.",type:"positive"},{title:"Evening entries are more consistent",description:"Most recorded entries were created later in the day.",actionable:"Keep the evening writing window available.",type:"neutral"}]},predictiveInsights:[] };

let browser;
(async()=>{
  browser=await chromium.launch({headless:true,channel:"chrome"});
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,colorScheme:"dark"});
  await context.addCookies([{name:"authjs.session-token",value:"local-journal-fixture",url:base}]);
  const page=await context.newPage(); let entries=structuredClone(initial); const mutations=[]; const searches=[]; const errors=[];
  page.on("pageerror",error=>errors.push(error.message)); page.on("console",message=>{if(message.type()==="error"&&!message.text().includes("status of 500"))errors.push(message.text());});
  await page.route("**/api/**",async route=>{
    const request=route.request(),url=new URL(request.url()),method=request.method();
    if(url.pathname==="/api/auth/session")return route.fulfill({json:{user:{name:"David",email:"journal-qa@example.invalid"},expires:"2099-01-01"}});
    if(url.pathname==="/api/notifications")return route.fulfill({json:{notifications:[],unreadCount:0}});
    if(url.pathname==="/api/ai/patterns")return route.fulfill({json:patternResponse});
    if(url.pathname==="/api/ai/chat")return route.fulfill({json:{reply:"Local Journal QA response."}});
    if(url.pathname==="/api/journal"&&method==="GET"){
      const search=(url.searchParams.get("search")||"").toLowerCase(); searches.push(search);
      const filtered=search?entries.filter(entry=>(entry.title||"").toLowerCase().includes(search)||entry.content.toLowerCase().includes(search)||entry.tags.some(tag=>tag.includes(search))):entries;
      return route.fulfill({json:{entries:filtered,total:filtered.length}});
    }
    if(url.pathname==="/api/journal"&&method==="POST"){
      const body=request.postDataJSON();mutations.push({method,path:url.pathname,body});
      const created={id:`created-${entries.length}`,date:"2026-09-20T09:30:00.000Z",wordCount:body.content.split(/\s+/).length,...body};entries=[created,...entries];return route.fulfill({status:201,json:created});
    }
    if(url.pathname.startsWith("/api/journal/")&&method==="DELETE"){
      mutations.push({method,path:url.pathname});entries=entries.filter(entry=>`/api/journal/${entry.id}`!==url.pathname);return route.fulfill({json:{message:"Deleted"}});
    }
    return route.fulfill({json:{}});
  });
  const capture=(name,fullPage=true)=>page.screenshot({path:path.join(output,`stage2d-${name}.png`),fullPage});
  await page.goto(`${base}/journal`,{waitUntil:"networkidle",timeout:120000});await page.getByRole("heading",{name:"Your archive"}).waitFor();
  await capture("desktop-populated");assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await page.getByText("September 2026",{exact:true}).count(),1);assert.equal(await page.getByText("August 2026",{exact:true}).count(),1);assert.equal(await page.getByText("433",{exact:true}).count(),1);

  await page.getByRole("button",{name:"Read What changed when I slowed down"}).click();await page.getByRole("dialog",{name:"What changed when I slowed down"}).waitFor();await page.waitForTimeout(350);await capture("desktop-long-entry",false);assert.equal(await page.getByText(/Paragraph 18/).count()>=1,true);await page.getByRole("button",{name:"Close journal entry"}).click();

  await page.getByRole("button",{name:"Write",exact:true}).click();await page.getByRole("dialog",{name:"Write what is here."}).waitFor();await page.getByLabel("Title optional").fill("A quieter working day");await page.getByLabel("Journal entry").fill("Today felt more deliberate because I protected one uninterrupted hour.");await page.getByRole("button",{name:"Good, 7 out of 10"}).click();await page.getByRole("button",{name:"Reflection",exact:true}).click();await page.getByLabel("Tags comma-separated").fill("work, attention");await page.waitForTimeout(350);await capture("desktop-writing",false);await page.getByRole("button",{name:"Save entry"}).click();await page.getByText("A quieter working day").waitFor();const created=mutations.findLast(item=>item.method==="POST");assert.equal(created.body.type,"REFLECTION");assert.equal(created.body.mood,7);assert.deepEqual(created.body.tags,["work","attention"]);

  await page.getByPlaceholder("Search entries").fill("gratitude");await page.waitForTimeout(450);await page.getByText("Three things worth keeping").waitFor();assert.equal(searches.at(-1),"gratitude");assert.equal(await page.getByText("What changed when I slowed down").count(),0);await page.getByPlaceholder("Search entries").fill("");await page.waitForTimeout(450);
  await page.getByRole("button",{name:"AI insights"}).click();await page.getByRole("heading",{name:"Whole-life patterns"}).waitFor();await page.getByText("Reflection follows focused work").waitFor();assert.equal(await page.getByText(/not a journal-only interpretation/i).count(),1);await capture("desktop-patterns",false);await page.getByRole("button",{name:"Close Novus review"}).click();

  page.once("dialog",dialog=>dialog.accept());await page.getByRole("button",{name:"Delete Three things worth keeping"}).click();await page.waitForTimeout(250);assert.deepEqual(mutations.at(-1),{method:"DELETE",path:"/api/journal/j2"});

  for(const [width,height] of [[390,844],[360,800]]){await page.setViewportSize({width,height});await page.reload({waitUntil:"networkidle"});await page.getByRole("heading",{name:"Your archive"}).waitFor();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await capture(`${width}x${height}`,false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const nav=await page.getByRole("navigation",{name:"Mobile navigation"}).boundingBox();assert(nav&&nav.y+nav.height<=height+1);}
  await page.getByRole("button",{name:"Write",exact:true}).click();await page.getByRole("dialog",{name:"Write what is here."}).waitFor();await page.getByLabel("Journal entry").fill("A mobile entry that remains readable while the available viewport becomes shorter.");await page.setViewportSize({width:390,height:560});await page.waitForTimeout(150);const editorBox=await page.getByRole("dialog",{name:"Write what is here."}).boundingBox();assert(editorBox&&editorBox.y>=0&&editorBox.y+editorBox.height<=561,`Short-height editor escaped viewport: ${JSON.stringify(editorBox)}`);await capture("mobile-keyboard-height",false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.getByRole("button",{name:"Close journal editor"}).click();

  entries=[];await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:"networkidle"});await page.getByText("Your first page is waiting").waitFor();await page.evaluate(()=>scrollTo(0,0));await capture("mobile-empty",false);await page.emulateMedia({reducedMotion:"reduce"});await page.reload({waitUntil:"networkidle"});await page.getByText("Your first page is waiting").waitFor();await page.evaluate(()=>scrollTo(0,0));await capture("mobile-reduced",false);assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('main > div > div')).animationName==="none"),true);

  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,"stage2d-journal-checks.json"),JSON.stringify({checks:["desktop populated chronology","long-entry reader","create contract and writing surface","search contract","truthful AI pattern scope","delete contract","390 and 360 mobile","keyboard-height editor","empty and reduced motion"],mutations,errors},null,2));console.log({checks:9,mutations:mutations.length,errors});await browser.close();
})().catch(async error=>{console.error(error);await browser?.close();process.exitCode=1;});
