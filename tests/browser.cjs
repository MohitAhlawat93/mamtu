const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const BASE = "https://mamtu.mohit-datascientist108.workers.dev";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  let browser;
  try {
    // The Cloudflare Git integration may still be deploying this commit.
    let found = false;
    for (let n = 0; n < 14; n++) {
      try {
        const resp = await fetch(BASE + "/", { cache: "no-store", signal: AbortSignal.timeout(14000) });
        const html = await resp.text();
        if (resp.ok && html.includes("Certain") && html.includes("atelier.css")) {
          found = true;
          break;
        }
        console.log("Waiting for correct live version: HTTP", resp.status, "attempt", n + 1);
      } catch (err) {
        console.log("Retry live fetch:", err.message);
      }
      await sleep(12000);
    }
    assert(found, "Live Cloudflare address did not serve new cinematic version");
    console.log("PASS current live homepage response:", BASE + "/");
    for (const asset of ["/atelier.css", "/atelier.js", "/media.js", "/assets/images/art-study-01.svg"]) {
      const resp = await fetch(BASE + asset, { signal: AbortSignal.timeout(15000) });
      assert.equal(resp.status, 200, "Missing live asset " + asset);
      console.log("PASS live asset", asset);
    }

    browser = await chromium.launch({ headless: true });
    fs.mkdirSync("artifacts", { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".hero-slide.is-active", { timeout: 12000 });
    assert.match(await page.title(), /MAMTU/);
    assert.equal(await page.locator(".hero-slide").count(), 6);
    assert.equal(await page.locator("#lookbookGrid .lookbook-card").count(), 6);
    await page.locator("#heroNext").click();
    assert.equal(await page.locator("#heroIndex").innerText(), "02");
    await page.waitForTimeout(6500);
    assert.equal(await page.locator("#heroIndex").innerText(), "03", "Auto slideshow did not advance after six seconds");
    await page.locator("#heroPause").click();
    assert.equal(await page.locator("#heroPause").getAttribute("aria-pressed"), "true");
    await page.locator("#lookbookGrid .lookbook-card").first().click();
    assert.equal(await page.locator("#lightbox").evaluate((node) => node.open), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#lightbox").evaluate((node) => node.open), false);
    await page.locator("#conciergeToggle").click();
    await page.locator("#conciergeQuestion").fill("How to add video?");
    await page.locator("#conciergeForm button").click();
    assert.match(await page.locator("#conciergeMessages").innerText(), /video|film/i);
    await page.locator("#conciergeClose").click();
    await page.screenshot({ path: "artifacts/mamtu-desktop.png", fullPage: true });
    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(desktopOverflow <= 2, "Desktop horizontal overflow: " + desktopOverflow);
    assert.deepEqual(errors, [], "JavaScript page errors on desktop");
    console.log("PASS desktop: hero, timed carousel, gallery, modal, concierge, no overflow");

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const mobileErrors = [];
    mobile.on("pageerror", (e) => mobileErrors.push(e.message));
    await mobile.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
    await mobile.waitForSelector(".hero-slide.is-active", { timeout: 12000 });
    await mobile.locator("#menuToggle").click();
    assert.equal(await mobile.locator("#mobileNav").isVisible(), true);
    await mobile.locator('#mobileNav a[href="#moments"]').click();
    assert.equal(await mobile.locator("#mobileNav").isVisible(), false);
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(overflow <= 2, "Mobile horizontal overflow: " + overflow);
    await mobile.screenshot({ path: "artifacts/mamtu-mobile.png", fullPage: true });
    assert.deepEqual(mobileErrors, [], "JavaScript page errors on mobile");
    console.log("PASS mobile 390x844: navigation, rendered layout, no JS errors, no overflow");
    console.log("LIVE_SITE_VERIFIED=" + BASE + "/");
  } catch (error) {
    console.error("LIVE_BROWSER_QA_FAILED", error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
})();
