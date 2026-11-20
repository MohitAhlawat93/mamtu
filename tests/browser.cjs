const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE="https://mamtu.mohit-datascientist108.workers.dev";
const pages=["/","/about.html","/gallery.html","/videos.html","/details.html","/contact.html"];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
let browser;
try{
  let ready=false;
  for(let attempt=0;attempt<20;attempt++){
    try{
      const res=await fetch(BASE+"/",{cache:"no-store",signal:AbortSignal.timeout(12000)});
      const html=await res.text();
      if(res.ok && html.includes('class="home-stage"') && html.includes("/gallery.html")){ready=true;break;}
    }catch(e){console.log("Still deploying:",e.message)}
    await sleep(12000);
  }
  assert(ready,"Cloudflare did not serve the redesigned homepage");
  for(const url of [...pages,"/atelier.css","/atelier.js","/assets/images/6.jpeg","/assets/images/3.jpeg","/assets/videos/1.mp4"]){
    const res=await fetch(BASE+url,{signal:AbortSignal.timeout(15000)});
    assert(res.ok,"Missing live page/asset "+url+" HTTP "+res.status);
    console.log("PASS HTTP "+res.status+" "+url);
  }
  browser=await chromium.launch({headless:true});
  fs.mkdirSync("artifacts",{recursive:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(BASE,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".featured-card").count(),3);
  assert.equal(await page.locator(".featured-card").nth(0).locator("img").getAttribute("src"),"/assets/images/6.jpeg");
  assert.equal(await page.locator(".featured-card").nth(1).locator("img").getAttribute("src"),"/assets/images/3.jpeg");
  assert.equal(await page.locator(".featured-card").nth(2).locator("video").getAttribute("src"),"/assets/videos/1.mp4");
  for(const index of [0,1]){
    const fit=await page.locator(".featured-card img").nth(index).evaluate(img=>getComputedStyle(img).objectFit);
    assert.equal(fit,"contain","Homepage image cropped");
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert(overflow<=2,"Desktop horizontal overflow "+overflow);
  await page.screenshot({path:"artifacts/mamtu-redesign-desktop.png",fullPage:true});
  await page.goto(BASE+"/gallery.html");
  assert.equal(await page.locator(".gallery-card").count(),8);
  await page.locator(".gallery-card").first().click();
  assert(await page.locator("#lightbox").evaluate(el=>el.open),"Lightbox didn't open");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#lightbox").evaluate(el=>el.open),false);
  await page.goto(BASE+"/videos.html");
  assert.equal(await page.locator("video").count(),3);
  await page.goto(BASE+"/contact.html");
  assert.equal(await page.locator('a[href="https://t.me/mistressmamtu"]').count()>0,true);
  assert.deepEqual(errors,[],"Desktop page errors");
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const mobileErrors=[];mobile.on("pageerror",e=>mobileErrors.push(e.message));
  await mobile.goto(BASE,{waitUntil:"domcontentloaded"});
  await mobile.locator(".nav-toggle").click();
  assert(await mobile.locator("#mobileNav").isVisible(),"Mobile navigation broken");
  await mobile.locator('#mobileNav a[href="/gallery.html"]').click();
  await mobile.waitForURL(/gallery/);
  assert.equal(await mobile.locator(".gallery-card").count(),8);
  const mobOverflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert(mobOverflow<=2,"Mobile horizontal overflow "+mobOverflow);
  await mobile.screenshot({path:"artifacts/mamtu-redesign-mobile.png",fullPage:true});
  assert.deepEqual(mobileErrors,[],"Mobile page errors");
  console.log("PASS: desktop & mobile, six routes, fully visible images, gallery, videos, Telegram");
}catch(err){console.error(err);process.exitCode=1}finally{if(browser)await browser.close()}
})();