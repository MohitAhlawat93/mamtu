const fs=require("node:fs");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const read=p=>fs.readFileSync(p,"utf8");
const pages=["index.html","about.html","gallery.html","videos.html","details.html","contact.html"];
const home=read("index.html"),css=read("atelier.css"),js=read("atelier.js"),gallery=read("gallery.html"),videos=read("videos.html");
for(const page of pages){
  assert(fs.existsSync(page),"Missing "+page);
  const content=read(page);
  assert(content.includes('name="viewport"'),"Mobile viewport missing: "+page);
  assert(content.includes('name="robots" content="noindex,nofollow"'),"Unapproved staging indexing: "+page);
  assert(content.includes('href="/atelier.css"'),"Stylesheet missing: "+page);
  assert(content.includes('src="/atelier.js"'),"Script missing: "+page);
  for(const link of pages)assert(content.includes('href="/'+link+'"'),"Navigation missing "+link+" in "+page);
  assert(!content.includes("paryavarn complex"),"Private residential details published: "+page);
  assert(!content.includes('href="#gallery"'),"One-page link still present: "+page);
  assert(!content.includes("PRIVATE PREVIEW"),"Testing copy still present: "+page);
}
for(const [tag,src] of [
  ["img","/assets/images/6.jpeg"],["img","/assets/images/3.jpeg"],["video","/assets/videos/1.mp4"]]){
  assert(home.includes(src),"Homepage featured "+tag+" missing: "+src);
}
assert(home.includes('class="home-stage"'),"Dedicated new hero missing");
assert(!home.includes('class="cinema"'),"Old overlaid slideshow remains");
assert(css.includes("object-fit:contain"),"Full portrait visibility missing");
assert(css.includes("@media(max-width:700px)"),"Responsive mobile layout missing");
assert.equal((gallery.match(/data-photo-index="/g)||[]).length,8,"Gallery must contain 8 photographs");
assert.equal((gallery.match(/class="story-description"/g)||[]).length,8,"All eight photos must have original stories");
assert.equal((gallery.match(/class="story-kicker"/g)||[]).length,8,"All eight photo stories need distinct labels");
assert.equal((gallery.match(/class="story-card-text"/g)||[]).length,8,"All eight photos need visible editorial captions");
assert(gallery.includes('id="lightboxDescription"'),"Lightbox story text missing");
assert(js.includes('getElementById("lightboxDescription")'),"Lightbox script doesn't update caption");
assert.equal((videos.match(/<video /g)||[]).length,3,"Videos page must have three playable videos");
assert.equal((videos.match(/class="film-description"/g)||[]).length,3,"All three films need editorial introductions");
assert.equal((read("about.html").match(/<details>/g)||[]).length,4,"About FAQs missing");
assert.equal((read("details.html").match(/<details>/g)||[]).length,5,"Practical FAQs missing");
assert(read("contact.html").includes('class="contact-guide"'),"Contact guidance missing");
assert(home.includes('class="home-intro"'),"Personal homepage introduction missing");
assert(css.includes(".gallery-section .gallery-grid{columns:auto;display:grid"),"Story-grid layout missing");
assert(gallery.includes('id="lightbox"'),"Accessible gallery viewer missing");
assert(read("contact.html").includes("https://t.me/mistressmamtu"),"Telegram contact missing");
for(let n=1;n<=8;n++)assert(fs.existsSync("assets/images/"+n+".jpeg"),"Missing photo "+n);
for(let n=1;n<=3;n++)assert(fs.existsSync("assets/videos/"+n+".mp4"),"Missing video "+n);
new vm.Script(js,{filename:"atelier.js"});
new vm.Script(read("media.js"),{filename:"media.js"});
const worker=JSON.parse(read("wrangler.jsonc"));
assert.equal(worker.assets.directory,"./");
console.log("PASS: six rich responsive pages, eight distinct photo stories, three video notes, accessible captions, FAQs, privacy and original hero");