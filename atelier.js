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
  const buttons=Array.from(document.querySelectorAll("[data-photo-index]"));
  const dialog=document.getElementById("lightbox");
  if(dialog && buttons.length){
    const image=document.getElementById("lightboxImage");
    const count=document.getElementById("lightboxCount");
    let index=0, focusBack=null;
    function show(i){
      index=(i+buttons.length)%buttons.length;
      const original=buttons[index].querySelector("img");
      image.src=original.currentSrc || original.src;
      image.alt=original.alt;
      count.textContent=String(index+1).padStart(2,"0")+" / "+String(buttons.length).padStart(2,"0");
    }
    buttons.forEach((button,i)=>button.addEventListener("click",()=>{
      focusBack=document.activeElement;show(i);dialog.showModal();
    }));
    document.getElementById("lightboxClose").addEventListener("click",()=>dialog.close());
    document.getElementById("lightboxPrev").addEventListener("click",()=>show(index-1));
    document.getElementById("lightboxNext").addEventListener("click",()=>show(index+1));
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