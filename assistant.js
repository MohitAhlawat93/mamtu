
"use strict";
(() => {
  const startup=performance.now();
  const currentPath=(()=>{const p=location.pathname||"/";return p==="/index.html"?"/":p})();
  const escapeHtml=(text)=>{const d=document.createElement("div");d.textContent=String(text??"");return d.innerHTML};
  const defaults={enabled:true,displayName:"Mamtu Assistant",subtitle:"Profile, services & practicalities.",welcome:"Hi ✦ I’m Mamtu Assistant.",defaultIntro:"Ask me about Mamtu’s public profile, gallery, services, practical details or how to get in touch.",pausedMessage:"Mamtu Assistant is taking a short pause. Please use WhatsApp or Telegram for anything time-sensitive."};
  const pageConfig={
    "/about.html":{intro:"I can help you get a quick sense of Mamtu before you read the full page.",prompts:[["At a glance","Tell me about Mamtu in a few lines."],["Personality","What is Mamtu like?"],["First hello","What matters when getting in touch?"]]},
    "/gallery.html":{intro:"Ask me about the public gallery, styles and the stories behind the current edit.",prompts:[["Gallery overview","What kind of photos are in Mamtu's gallery?"],["Style","How would you describe Mamtu's public style?"],["Traditional look","Tell me about the softer traditional look."]]},
    "/videos.html":{intro:"I can help you understand what the video page contains and where to explore next.",prompts:[["Video collection","What is on Mamtu's video page?"],["Photos too","Where can I see Mamtu's photographs?"],["About Mamtu","Tell me about Mamtu."]]},
    "/services.html":{intro:"Tell me what kind of plan you have in mind and I’ll point you to the right public information.",prompts:[["Services","What services are listed?"],["Pricing","Are prices published?"],["Availability","How do I ask about availability?"]]},
    "/reviews.html":{intro:"I can explain how Mamtu’s review page works and why it avoids fabricated testimonials.",prompts:[["Reviews","Are there public reviews yet?"],["Trust","How does the site handle reviews?"],["Contact","How can I contact Mamtu?"]]},
    "/details.html":{intro:"I can make the practical details easier to understand.",prompts:[["Location","Where is Mamtu based?"],["Privacy","What privacy details should I know?"],["Contact","What are Mamtu's official contact routes?"]]},
    "/contact.html":{intro:"I can help you decide what to include in a respectful first message.",prompts:[["Draft hello","What should I include in my first message?"],["WhatsApp","What is Mamtu's WhatsApp?"],["Telegram","What is Mamtu's Telegram?"]]}
  };
  let publicConfig={...defaults},enabled=true;
  const cfg=pageConfig[currentPath]||{intro:defaults.defaultIntro,prompts:[["About Mamtu","Tell me about Mamtu."],["Services","What services are listed?"],["Contact","How can I contact Mamtu?"]]};
  const safeSessionGet=(key)=>{try{return sessionStorage.getItem(key)}catch{return null}};
  const safeSessionSet=(key,value)=>{try{sessionStorage.setItem(key,value)}catch{}};

  const panelHtml=
    '<button class="assistant-launcher" type="button" data-open-assistant aria-label="Open Mamtu Assistant" aria-expanded="false" aria-controls="mamtu-assistant"><span class="assistant-spark" aria-hidden="true">✦</span><span>Mamtu Assistant</span></button>'+
    '<aside class="assistant-panel" id="mamtu-assistant" data-assistant-panel hidden role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="mamtu-assistant-title">'+
      '<div class="assistant-head"><div><strong id="mamtu-assistant-title">Mamtu Assistant</strong><small>'+escapeHtml(defaults.subtitle)+'</small></div><div class="assistant-head-actions"><button class="assistant-size-toggle" type="button" data-chat-size-toggle aria-expanded="false" aria-controls="mamtu-chat-size">Size</button><button class="assistant-minimize" type="button" data-minimize-assistant aria-label="Minimize Mamtu Assistant">−</button></div></div>'+
      '<div class="assistant-size-popover" id="mamtu-chat-size" data-chat-size-popover hidden><div><span>Width</span><button type="button" data-chat-width="-1">−</button><button type="button" data-chat-width="1">+</button></div><div><span>Height</span><button type="button" data-chat-height="-1">−</button><button type="button" data-chat-height="1">+</button></div><button type="button" class="assistant-size-reset" data-chat-size-reset>Reset size</button></div>'+
      '<button class="assistant-resize-grip" type="button" data-chat-resize-grip aria-label="Drag to resize chat"></button>'+
      '<div class="assistant-thread" data-assistant-thread aria-live="polite"><div class="assistant-message assistant"><p>'+escapeHtml(defaults.welcome)+'</p><p>'+escapeHtml(cfg.intro)+'</p></div></div>'+
      '<div class="assistant-chips" data-assistant-chips></div>'+
      '<form class="assistant-form" data-assistant-form><input type="text" maxlength="600" autocomplete="off" placeholder="Ask something discreetly…" aria-label="Message Mamtu Assistant" required><button type="submit" aria-label="Send">↗</button></form>'+
      '<p class="assistant-disclaimer">Please don’t send ID documents, financial details, passwords or other sensitive personal information here.</p>'+
    '</aside>'+
    '<button class="afterhours-launcher" type="button" data-afterhours-launcher aria-label="Open Mamtu Afterhours and official links"><span class="afterhours-spark" aria-hidden="true">✦</span><span class="afterhours-copy"><small>Stay close</small><strong>Afterhours</strong></span></button>';
  document.body.insertAdjacentHTML("beforeend",panelHtml);

  const panel=document.querySelector("[data-assistant-panel]");
  const launcher=document.querySelector("[data-open-assistant]");
  const thread=document.querySelector("[data-assistant-thread]");
  const form=document.querySelector("[data-assistant-form]");
  const input=form?.querySelector("input");
  const send=form?.querySelector('button[type="submit"]');
  const chips=document.querySelector("[data-assistant-chips]");
  let returnFocus=null;

  function setAssistant(open){
    if(!panel)return;
    if(open)returnFocus=document.activeElement;
    panel.hidden=!open;
    panel.setAttribute("aria-hidden",String(!open));
    panel.setAttribute("aria-modal",String(open&&matchMedia("(min-width: 641px)").matches));
    launcher?.toggleAttribute("hidden",open);
    launcher?.setAttribute("aria-expanded",String(open));
    document.body.classList.toggle("assistant-open",open);
    if(open&&!matchMedia("(max-width: 640px)").matches)setTimeout(()=>input?.focus(),50);
    else if(!open&&returnFocus instanceof HTMLElement)returnFocus.focus();
  }
  launcher?.addEventListener("click",()=>setAssistant(true));
  document.querySelector("[data-minimize-assistant]")?.addEventListener("click",()=>setAssistant(false));

  cfg.prompts.forEach(([label,prompt])=>{
    const b=document.createElement("button");
    b.type="button";b.className="assistant-chip";b.textContent=label;b.dataset.chatPrompt=prompt;
    chips?.appendChild(b);
  });

  fetch("/api/assistant-config",{headers:{Accept:"application/json"},cache:"no-store"})
    .then(async r=>r.ok?r.json():null)
    .then(payload=>{
      if(!payload?.config)return;
      publicConfig={...defaults,...payload.config};enabled=publicConfig.enabled!==false;
      const title=document.querySelector("#mamtu-assistant-title"),sub=document.querySelector(".assistant-head small");
      if(title)title.textContent=publicConfig.displayName;if(sub)sub.textContent=publicConfig.subtitle;
      const name=launcher?.querySelector("span:last-child");if(name)name.textContent=publicConfig.displayName;
      if(launcher)launcher.setAttribute("aria-label","Open "+publicConfig.displayName);
      if(!enabled){if(form)form.hidden=true;if(chips)chips.hidden=true}
    }).catch(()=>{});

  const history=[];
  const remember=(role,content)=>{history.push({role,content:String(content).slice(0,800)});if(history.length>8)history.splice(0,history.length-8)};
  const formatText=(text="")=>{
    const safe=escapeHtml(String(text).replace(/\\n/g,"\n").replace(/\r\n/g,"\n").trim());
    const lines=safe.split("\n"),out=[];let list=false;
    const close=()=>{if(list){out.push("</ul>");list=false}};
    for(const raw of lines){
      const line=raw.trim();if(!line){close();continue}
      const bullet=line.match(/^[-•]\s+(.*)$/);
      if(bullet){if(!list){out.push("<ul>");list=true}out.push("<li>"+bullet[1].replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")+"</li>");continue}
      close();out.push("<p>"+line.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")+"</p>");
    }
    close();return out.join("");
  };
  const addMessage=(role,text,extra="")=>{
    if(!thread)return null;
    const el=document.createElement("div");el.className=("assistant-message "+role+" "+extra).trim();el.innerHTML=formatText(text);thread.appendChild(el);thread.scrollTop=thread.scrollHeight;return el;
  };
  const safeHref=(href="")=>/^\/(?!\/)|^https:\/\/(?:wa\.me|t\.me)\/|^mailto:/i.test(href)?href:"";
  const renderActions=(actions=[])=>{
    if(!thread||!Array.isArray(actions)||!actions.length)return;
    const wrap=document.createElement("div");wrap.className="assistant-actions";
    actions.slice(0,4).forEach(action=>{
      if(action?.type==="prompt"&&action.prompt){
        const b=document.createElement("button");b.type="button";b.className="assistant-action";b.textContent=action.label||"Continue";b.addEventListener("click",()=>ask(action.prompt));wrap.appendChild(b);return;
      }
      if(action?.type==="copy"&&action.text){
        const b=document.createElement("button");b.type="button";b.className="assistant-action";b.textContent=action.label||"Copy";b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(action.text);b.textContent="Copied ✓"}catch{b.textContent="Copy unavailable"}});wrap.appendChild(b);return;
      }
      if(action?.type==="link"&&action.href){
        const href=safeHref(action.href);if(!href)return;
        const a=document.createElement("a");a.className="assistant-action";a.href=href;a.textContent=(action.label||"Open")+" →";
        if(action.external&&/^https:/i.test(href)){a.target="_blank";a.rel="noopener noreferrer"}wrap.appendChild(a);
      }
    });
    if(wrap.childElementCount){thread.appendChild(wrap);thread.scrollTop=thread.scrollHeight}
  };
  async function localGroundedAnswer(message=""){
    const q=String(message).toLowerCase();
    let data=null;try{data=(await import("/data/mamtu-data.js")).MAMTU_DATA}catch{}
    const c=data?.contact||{whatsappDisplay:"+91 836 841 0417",telegramHandle:"@mistressmamtu"};
    if(/^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[!.?\\s]*$/.test(q))return "Hi ✦ Lovely to meet you. I’m Mamtu Assistant. What would you like to know?";
    if(/who are you|your name/.test(q))return "I’m Mamtu Assistant ✦ I can help with Mamtu’s public profile, gallery, services, practical details and contact routes.";
    if(/where|location|saket|delhi|based/.test(q))return "Mamtu is publicly based in Saket, New Delhi. Her exact private residential address is intentionally not published.";
    if(/price|pricing|rate|cost|how much|fee/.test(q))return "Exact pricing is not published on the website. Please ask Mamtu directly through WhatsApp or Telegram for current details.";
    if(/available|availability|today|tonight|tomorrow/.test(q))return "Live availability is not published or guaranteed by the website. Mamtu confirms current availability herself through her official contact channels.";
    if(/whatsapp|phone|number/.test(q))return "Mamtu’s official WhatsApp is "+c.whatsappDisplay+".";
    if(/telegram|afterhours|stay close/.test(q))return "Mamtu’s official Telegram is "+c.telegramHandle+". You can also open the Stay close / Afterhours button for all official links.";
    if(/review|testimonial|feedback/.test(q))return "There are no public reviews published yet. The website deliberately avoids fabricated testimonials.";
    if(/service|appointment|dinner|outcall|extended|occasion|tailored/.test(q))return "Mamtu’s public Services page includes private appointments, dinner & conversation, outcall enquiries, extended time, social occasions and tailored enquiries. Exact arrangements are discussed privately.";
    if(/gallery|photo|picture|style|outfit/.test(q))return "Mamtu’s gallery is a growing personal collection with mirror portraits, casual looks, travel moments and traditional styling.";
    if(/video|film|clip/.test(q))return "Mamtu’s video page contains the current personal video collection and is designed to grow over time.";
    if(/privacy|address|boundary|documents|sensitive/.test(q))return "Mamtu keeps her exact private address off the public site. Please don’t send identity documents, financial information, passwords or other sensitive data through the assistant.";
    return "I can help with Mamtu’s public profile, gallery, videos, services, reviews, practical details and official contact routes. For current pricing or availability, please contact Mamtu directly.";
  }

  async function ask(message,display=message){
    const q=String(message||"").trim();if(!q||!enabled)return;
    if(chips)chips.hidden=true;addMessage("user",String(display||q).trim()||q);remember("user",q);
    const pending=addMessage("assistant","Just a moment ✦","pending");
    if(input)input.disabled=true;if(send)send.disabled=true;
    try{
      const r=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,history:history.slice(0,-1),page:currentPath})});
      const data=await r.json();if(!r.ok)throw new Error(data?.error||"Assistant unavailable");
      pending?.remove();addMessage("assistant",data.answer);remember("assistant",data.answer);renderActions(data.actions);
      if(data.suggestion?.path){
        const a=document.createElement("a");a.className="assistant-suggestion";a.href=data.suggestion.path;a.textContent=data.suggestion.label+" →";
        thread?.appendChild(a);if(thread)thread.scrollTop=thread.scrollHeight;
      }
    }catch{
      pending?.remove();
      const msg=await localGroundedAnswer(q);
      addMessage("assistant",msg);remember("assistant",msg);
    }finally{
      if(send)send.disabled=false;
      if(input){input.disabled=false;input.value="";if(!matchMedia("(max-width: 640px)").matches)input.focus()}
    }
  }
  form?.addEventListener("submit",e=>{e.preventDefault();if(input)ask(input.value)});
  document.querySelectorAll("[data-chat-prompt]").forEach(b=>b.addEventListener("click",()=>ask(b.dataset.chatPrompt||"",b.textContent||"")));

  const SIZE_KEY="mamtu-assistant-size-v1";
  const sizeToggle=document.querySelector("[data-chat-size-toggle]");
  const sizePopover=document.querySelector("[data-chat-size-popover]");
  const grip=document.querySelector("[data-chat-resize-grip]");
  const desktop=()=>matchMedia("(min-width: 641px)").matches;
  const bounds=()=>({minW:340,maxW:Math.max(340,Math.min(760,innerWidth-40)),minH:360,maxH:Math.max(360,innerHeight-40)});
  const applySize=(w,h,{persist=true}={})=>{
    if(!panel||!desktop())return;
    const b=bounds(),width=Math.max(b.minW,Math.min(b.maxW,Number(w)||panel.getBoundingClientRect().width)),height=Math.max(b.minH,Math.min(b.maxH,Number(h)||panel.getBoundingClientRect().height));
    panel.style.width=Math.round(width)+"px";panel.style.height=Math.round(height)+"px";
    if(persist)try{localStorage.setItem(SIZE_KEY,JSON.stringify({width:Math.round(width),height:Math.round(height)}))}catch{}
  };
  try{const saved=JSON.parse(localStorage.getItem(SIZE_KEY)||"null");if(saved?.width&&saved?.height)applySize(saved.width,saved.height,{persist:false})}catch{}
  sizeToggle?.addEventListener("click",e=>{e.stopPropagation();if(!desktop())return;const open=sizePopover?.hasAttribute("hidden");sizePopover?.toggleAttribute("hidden",!open);sizeToggle.setAttribute("aria-expanded",String(Boolean(open)))});
  document.querySelectorAll("[data-chat-width]").forEach(b=>b.addEventListener("click",()=>{const r=panel?.getBoundingClientRect();if(r)applySize(r.width+Number(b.dataset.chatWidth||0)*80,r.height)}));
  document.querySelectorAll("[data-chat-height]").forEach(b=>b.addEventListener("click",()=>{const r=panel?.getBoundingClientRect();if(r)applySize(r.width,r.height+Number(b.dataset.chatHeight||0)*80)}));
  document.querySelector("[data-chat-size-reset]")?.addEventListener("click",()=>{try{localStorage.removeItem(SIZE_KEY)}catch{}panel?.style.removeProperty("width");panel?.style.removeProperty("height")});
  grip?.addEventListener("pointerdown",event=>{
    if(!panel||!desktop()||event.button>0)return;
    event.preventDefault();const start=panel.getBoundingClientRect(),x=event.clientX,y=event.clientY;grip.setPointerCapture?.(event.pointerId);
    const move=e=>applySize(start.width+(x-e.clientX),start.height+(y-e.clientY),{persist:false});
    const end=()=>{document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",end);const r=panel.getBoundingClientRect();applySize(r.width,r.height)};
    document.addEventListener("pointermove",move);document.addEventListener("pointerup",end,{once:true});
  });

  let popupReturn=null;
  const closeAfterhours=()=>{
    const popup=document.querySelector("[data-afterhours-popup]");if(!popup)return;
    popup.classList.remove("is-visible");
    setTimeout(()=>{popup.remove();if(popupReturn instanceof HTMLElement)popupReturn.focus()},220);
  };
  async function openAfterhours(){
    if(document.querySelector("[data-afterhours-popup]"))return;
    if(!panel?.hidden)setAssistant(false);popupReturn=document.activeElement;
    let data=null;try{data=(await import("/data/mamtu-data.js")).MAMTU_DATA}catch{}
    const c=data?.contact||{whatsappDisplay:"+91 836 841 0417",whatsappUrl:"https://wa.me/918368410417",telegramHandle:"@mistressmamtu",telegramUrl:"https://t.me/mistressmamtu"};
    const after=data?.afterhours||{title:"Mamtu Afterhours",kicker:"Stay close",body:"Official ways to stay in touch, all in one place.",primaryUrl:c.whatsappUrl,primaryLabel:"WhatsApp",primaryDetail:c.whatsappDisplay};
    const links=[
      {label:"Telegram",detail:c.telegramHandle,href:c.telegramUrl,external:true},
      {label:"Gallery",detail:"The growing photo collection",href:"/gallery.html"},
      {label:"Services",detail:"Public service categories",href:"/services.html"},
      {label:"Contact",detail:"All official contact options",href:"/contact.html"}
    ];
    const grid=links.map(item=>'<a href="'+escapeHtml(item.href)+'"'+(item.external?' target="_blank" rel="noopener noreferrer"':'')+'><span>'+escapeHtml(item.label)+'</span><small>'+escapeHtml(item.detail)+'</small><b aria-hidden="true">↗</b></a>').join("");
    const popup=document.createElement("div");popup.className="afterhours-backdrop";popup.dataset.afterhoursPopup="true";
    popup.innerHTML=
      '<aside class="afterhours-card" role="dialog" aria-modal="true" aria-labelledby="afterhours-title">'+
      '<button class="afterhours-close" type="button" data-close-afterhours aria-label="Close Mamtu Afterhours">×</button>'+
      '<span class="afterhours-kicker">'+escapeHtml(after.kicker||"Stay close")+'</span>'+
      '<h2 id="afterhours-title">'+escapeHtml(after.title||"Mamtu Afterhours")+'</h2>'+
      '<p class="afterhours-intro">'+escapeHtml(after.body||"Official ways to stay in touch, all in one place.")+'</p>'+
      '<a class="afterhours-primary" href="'+escapeHtml(after.primaryUrl||c.telegramUrl)+'" target="_blank" rel="noopener noreferrer"><span><small>'+escapeHtml(after.primaryLabel||"Telegram")+'</small><strong>'+escapeHtml(after.primaryDetail||c.telegramHandle)+'</strong></span><b aria-hidden="true">↗</b></a>'+
      '<div class="afterhours-grid">'+grid+'</div>'+
      '<p class="afterhours-note">Use only Mamtu’s official public contact routes. Exact availability, pricing and private location details are confirmed directly by Mamtu.</p>'+
      '</aside>';
    document.body.appendChild(popup);
    requestAnimationFrame(()=>popup.classList.add("is-visible"));
    popup.querySelector("[data-close-afterhours]")?.addEventListener("click",closeAfterhours);
    popup.addEventListener("click",e=>{if(e.target===popup)closeAfterhours()});
    popup.querySelector("[data-close-afterhours]")?.focus();
  }
  document.querySelector("[data-afterhours-launcher]")?.addEventListener("click",openAfterhours);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeAfterhours();if(!panel?.hidden)setAssistant(false)}});

  const AUTO_KEY="mamtu-assistant-autoshown-v1";
  setTimeout(()=>{
    if(!enabled||safeSessionGet(AUTO_KEY)==="1"||!panel?.hidden||document.querySelector("[data-afterhours-popup]"))return;
    safeSessionSet(AUTO_KEY,"1");setAssistant(true);
  },Math.max(850,1200-(performance.now()-startup)));
})();
