"use strict";
(() => {
  const mobile=document.getElementById("mobileNav");
  const toggle=document.querySelector(".nav-toggle");
  if(toggle && mobile){
    const setMenu=open=>{
      mobile.hidden=!open;
      toggle.setAttribute("aria-expanded",String(open));
      toggle.setAttribute("aria-label",open?"Close menu":"Open menu");
    };
    toggle.addEventListener("click",()=>setMenu(mobile.hidden));
    mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setMenu(false)));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
    document.addEventListener("click",e=>{if(!mobile.hidden && !mobile.contains(e.target) && !toggle.contains(e.target))setMenu(false)});
  }
  document.querySelectorAll("[data-year]").forEach(el=>el.textContent=String(new Date().getFullYear()));

  // Premium lightbox — works with or without story captions
  const buttons=Array.from(document.querySelectorAll("[data-photo-index]"));
  const dialog=document.getElementById("lightbox");
  if(dialog && buttons.length){
    const image=document.getElementById("lightboxImage");
    const count=document.getElementById("lightboxCount");
    const kickerEl=document.getElementById("lightboxKicker");
    const titleEl=document.getElementById("lightboxTitle");
    const descEl=document.getElementById("lightboxDescription");
    let index=0, focusBack=null;

    function show(i){
      index=(i+buttons.length)%buttons.length;
      const original=buttons[index].querySelector("img");
      if(!original)return;
      image.src=original.currentSrc || original.src;
      image.alt=original.alt || "Mamtu";

      // Optional story fields (old layout) — safely ignored if missing
      const card=buttons[index].closest(".story-card");
      if(kickerEl)kickerEl.textContent=card?.querySelector(".story-kicker")?.textContent || "";
      if(titleEl)titleEl.textContent=card?.querySelector("h2")?.textContent || "";
      if(descEl)descEl.textContent=card?.querySelector(".story-description")?.textContent || "";

      if(count)count.textContent=String(index+1).padStart(2,"0")+" / "+String(buttons.length).padStart(2,"0");
    }

    buttons.forEach((button,i)=>button.addEventListener("click",()=>{
      focusBack=document.activeElement;
      show(i);
      dialog.showModal();
    }));

    const closeBtn=document.getElementById("lightboxClose");
    const prevBtn=document.getElementById("lightboxPrev");
    const nextBtn=document.getElementById("lightboxNext");
    if(closeBtn)closeBtn.addEventListener("click",()=>dialog.close());
    if(prevBtn)prevBtn.addEventListener("click",()=>show(index-1));
    if(nextBtn)nextBtn.addEventListener("click",()=>show(index+1));

    dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
    dialog.addEventListener("close",()=>focusBack?.focus());
    document.addEventListener("keydown",event=>{
      if(!dialog.open)return;
      if(event.key==="ArrowLeft")show(index-1);
      else if(event.key==="ArrowRight")show(index+1);
    });
  }

  document.querySelectorAll("video").forEach(current=>{
    current.addEventListener("play",()=>{
      document.querySelectorAll("video").forEach(other=>{
        if(other!==current && !other.paused)other.pause();
      });
    });
  });
})();
