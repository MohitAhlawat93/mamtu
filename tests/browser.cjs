const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE="https://mamtu.mohit-datascientist108.workers.dev";
const routes=["/","/about.html","/gallery.html","/videos.html","/services.html","/reviews.html","/details.html","/contact.html"];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
let browser;
try{
  let ready=false;
  for(let attempt=0;attempt<20;attempt++){
    try{
      const res=await fetch(BASE+"/",{cache:"no-store",signal:AbortSignal.timeout(12000)});
      const html=await res.text();
      if(res.ok && html.includes('class="useful-bits"') && html.includes("/services.html") && html.includes("/reviews.html")){ready=true;break;}
    }catch(e){console.log("Still deploying:",e.message)}
    await sleep(12000);
  }
  assert(ready,"Cloudflare did not serve the expanded Mamtu homepage");
  for(const url of [...routes,"/atelier.css?v=editorial-20261120-v3","/atelier.js?v=editorial-20261120-v3","/assistant.css?v=rag-20261120-v3","/assistant.js?v=rag-20261120-v3","/data/mamtu-data.js","/assets/mark.svg"]){
    const res=await fetch(BASE+url,{signal:AbortSignal.timeout(15000)});
    assert(res.ok,"Missing live route/asset "+url+" HTTP "+res.status);
  }
  browser=await chromium.launch({headless:true});
  fs.mkdirSync("artifacts",{recursive:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  const configResponse=await fetch(BASE+"/api/assistant-config",{signal:AbortSignal.timeout(15000)});
  assert(configResponse.ok,"Assistant config endpoint unavailable");
  const configPayload=await configResponse.json();
  assert.equal(configPayload.config.displayName,"Mamtu Assistant");
  const assistantResponse=await fetch(BASE+"/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:"Where is Mamtu based?",history:[],page:"/"}),signal:AbortSignal.timeout(20000)});
  assert(assistantResponse.ok,"Assistant endpoint unavailable");
  const assistantPayload=await assistantResponse.json();
  assert(/Saket|New Delhi/i.test(assistantPayload.answer),"Grounded assistant answer missing public base");
  await page.goto(BASE,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".featured-card").count(),3);
  assert.equal(await page.locator(".brand-mark").count()>0,true);
  assert.equal(await page.locator(".useful-row").count(),8);
  assert.equal(await page.locator(".home-service-card").count(),3);
  assert.equal(await page.locator('a[href="/services.html"]').count()>0,true);
  assert.equal(await page.locator('a[href="/reviews.html"]').count()>0,true);
  await page.waitForSelector("[data-open-assistant]",{timeout:10000});
  assert.equal((await page.locator("[data-open-assistant]").innerText()).includes("Mamtu Assistant"),true);
  await page.locator("[data-afterhours-launcher]").click();
  await page.waitForSelector("[data-afterhours-popup].is-visible",{timeout:5000});
  assert.equal((await page.locator("[data-afterhours-popup]").innerText()).includes("Mamtu Afterhours"),true);
  const primaryAfterhours=page.locator(".afterhours-primary");
  assert.equal((await primaryAfterhours.innerText()).includes("WhatsApp"),true);
  assert.equal((await primaryAfterhours.innerText()).includes("+91 836 841 0417"),true);
  assert.equal(await primaryAfterhours.getAttribute("href"),"https://wa.me/918368410417");
  await page.keyboard.press("Escape");
  for(const index of [0,1]){
    const fit=await page.locator(".featured-card img").nth(index).evaluate(img=>getComputedStyle(img).objectFit);
    assert.equal(fit,"contain","Homepage image cropped");
  }
  const bodyText=await page.locator("body").innerText();
  assert(!/PHOTO\s+0\d/i.test(bodyText),"Numbered photo label visible on homepage");
  assert(!/VIDEO\s+0\d/i.test(bodyText),"Numbered video label visible on homepage");
  await page.goto(BASE+"/gallery.html");
  assert.equal(await page.locator(".gallery-card").count(),8);
  assert.equal(await page.locator(".story-description").count(),8);
  assert.equal(await page.locator("#lightboxCount").count(),0);
  await page.locator(".gallery-card").first().click();
  assert(await page.locator("#lightbox").evaluate(el=>el.open),"Lightbox did not open");
  assert((await page.locator("#lightboxTitle").innerText()).length>5);
  await page.keyboard.press("Escape");
  await page.goto(BASE+"/services.html");
  assert.equal(await page.locator(".service-card").count(),6);
  await page.goto(BASE+"/reviews.html");
  assert((await page.locator(".review-empty-state").innerText()).includes("No public reviews"));
  await page.goto(BASE+"/contact.html");
  assert.equal(await page.locator('a[href="https://wa.me/918368410417"]').count()>0,true);
  assert((await page.locator("body").innerText()).includes("+91 836 841 0417"));
  assert.deepEqual(errors,[],"Desktop page errors");
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const mobileErrors=[];mobile.on("pageerror",e=>mobileErrors.push(e.message));
  await mobile.goto(BASE,{waitUntil:"domcontentloaded"});
  await mobile.waitForSelector("[data-open-assistant]",{timeout:10000});
  assert.equal(await mobile.locator("[data-afterhours-launcher]").count(),1);
  await mobile.locator("[data-open-assistant]").click();
  const mobilePanel=mobile.locator("[data-assistant-panel]");
  const panelBox=await mobilePanel.boundingBox();
  assert(panelBox && panelBox.width<=282,"Mobile assistant is too wide");
  assert(panelBox && panelBox.height<=312,"Mobile assistant is too tall");
  await mobile.locator("[data-minimize-assistant]").click();
  await mobile.locator(".nav-toggle").click();
  assert(await mobile.locator("#mobileNav").isVisible(),"Mobile navigation broken");
  assert.equal(await mobile.locator('#mobileNav a[href="/services.html"]').count(),1);
  assert.equal(await mobile.locator('#mobileNav a[href="/reviews.html"]').count(),1);
  const overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert(overflow<=2,"Mobile horizontal overflow "+overflow);
  await mobile.screenshot({path:"artifacts/mamtu-expanded-mobile.png",fullPage:true});
  assert.deepEqual(mobileErrors,[],"Mobile errors");
  console.log("PASS: expanded Mamtu site routes, branding, useful bits, services, honest reviews, unnumbered media and contacts");
}catch(err){console.error(err);process.exitCode=1}finally{if(browser)await browser.close()}
})();