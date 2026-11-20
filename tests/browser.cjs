const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const BASE = "https://mamtu.mohit-datascientist108.workers.dev";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  let browser;
  try {
    let ready = false;
    for (let i=0; i<18; i++) {
      try {
        const response = await fetch(BASE+"/", {cache:"no-store", signal:AbortSignal.timeout(15000)});
        const html = await response.text();
        if (response.ok && html.includes("Meet <em>Mamtu.") && html.includes('id="filmsGrid"')) {
          ready = true; break;
        }
        console.log("Waiting for profile release, attempt "+(i+1)+" HTTP "+response.status);
      } catch(err) { console.log("Waiting for Cloudflare: "+err.message); }
      await sleep(12000);
    }
    assert(ready, "Live URL did not serve updated Mamtu profile");
    console.log("PASS profile released: "+BASE+"/");
    for(const asset of ["/atelier.css","/atelier.js","/media.js","/assets/images/6.jpeg","/assets/images/3.jpeg","/assets/videos/1.mp4","/assets/videos/2.mp4","/assets/videos/3.mp4"]){
      const r = await fetch(BASE+asset,{signal:AbortSignal.timeout(15000)});
      assert.equal(r.status,200,"Live asset not found: "+asset);
      console.log("PASS "+asset+" HTTP 200");
    }
    browser=await chromium.launch({headless:true});
    fs.mkdirSync("artifacts",{recursive:true});
    const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto(BASE,{waitUntil:"domcontentloaded",timeout:30000});
    await page.waitForSelector(".hero-slide.is-active",{timeout:10000});
    assert.equal(await page.locator(".hero-slide").count(),3);
    assert.equal(await page.locator(".hero-slide").nth(0).locator("img").getAttribute("src"),"/assets/images/6.jpeg");
    assert.equal(await page.locator(".hero-slide").nth(1).locator("img").getAttribute("src"),"/assets/images/3.jpeg");
    assert.equal(await page.locator(".hero-slide").nth(2).locator("video").getAttribute("src"),"/assets/videos/1.mp4");
    assert.equal(await page.locator("#lookbookGrid .lookbook-card").count(),8);
    assert.equal(await page.locator("#filmsGrid .film-card").count(),3);
    assert.equal(await page.locator("#filmsGrid video").nth(1).getAttribute("src"),"/assets/videos/2.mp4");
    await page.locator("#heroNext").click();
    assert.equal((await page.locator("#heroIndex").innerText()).trim(),"02");
    await page.waitForTimeout(6500);
    assert.equal((await page.locator("#heroIndex").innerText()).trim(),"03","Hero did not rotate to video after photo 3");
    assert.equal(await page.locator(".hero-slide.is-active").getAttribute("data-kind"),"video");
    await page.locator("#heroPause").click();
    assert.equal(await page.locator("#heroPause").getAttribute("aria-pressed"),"true");
    await page.locator(".lookbook-card").first().click();
    assert(await page.locator("#lightbox").evaluate(el=>el.open));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#lightbox").evaluate(el=>el.open),false);
    assert.equal(await page.locator('.nav-enquiry').getAttribute("href"),"https://t.me/mistressmamtu");
    assert.equal(await page.locator("#conciergeToggle").count(),0);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(overflow<=2,"Desktop horizontal overflow "+overflow);
    assert.deepEqual(errors,[],"Browser JS errors on desktop");
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:"artifacts/mamtu-desktop.png",fullPage:true});
    console.log("PASS desktop: numbered hero, 8 photos, 3 films, carousel, lightbox, Telegram, no JS errors/overflow");

    const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const mobileErrors=[];
    mobile.on("pageerror",e=>mobileErrors.push(e.message));
    await mobile.goto(BASE,{waitUntil:"domcontentloaded",timeout:30000});
    await mobile.waitForSelector(".hero-slide.is-active",{timeout:10000});
    await mobile.locator("#heroPause").click();
    assert.equal(await mobile.locator("#heroPause").getAttribute("aria-pressed"),"true");
    await mobile.locator("#menuToggle").click();
    assert.equal(await mobile.locator("#mobileNav").isVisible(),true);
    await mobile.locator('#mobileNav a[href="#gallery"]').click();
    assert.equal(await mobile.locator("#mobileNav").isVisible(),false);
    const mobOverflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(mobOverflow<=2,"Mobile horizontal overflow "+mobOverflow);
    assert.deepEqual(mobileErrors,[],"Mobile JS errors");
    await mobile.evaluate(()=>window.scrollTo(0,0));
    await mobile.screenshot({path:"artifacts/mamtu-mobile.png",fullPage:true});
    console.log("PASS mobile 390x844: navigation, media, controls, no JS errors/overflow");
    console.log("LIVE_VERIFIED="+BASE+"/");
  } catch(error) {
    console.error("LIVE_QA_FAILED",error);
    process.exitCode=1;
  } finally { if(browser) await browser.close(); }
})();