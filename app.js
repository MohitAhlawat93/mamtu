/* MAMTU preview — all imagery is original CSS artwork until client media is approved. */
const OWNER_CONTACT_EMAIL = ''; // Add owner-verified email; never invent.
const FEATURE_VIDEO_ENABLED = false; // Set true after assets/videos/feature.mp4 exists.
const gallery=[
 {title:'Crimson interlude',subtitle:'ART STUDY / 01',file:'assets/images/art-study-01.svg'},
 {title:'An elegant pause',subtitle:'ART STUDY / 02',file:'assets/images/art-study-02.svg'},
 {title:'Light & shadow',subtitle:'ART STUDY / 03',file:'assets/images/art-study-03.svg'},
 {title:'The quiet moment',subtitle:'ART STUDY / 04',file:'assets/images/art-study-04.svg'},
 {title:'Between the lines',subtitle:'ART STUDY / 05',file:'assets/images/art-study-05.svg'},
 {title:'A study in presence',subtitle:'ART STUDY / 06',file:'assets/images/art-study-06.svg'}
];
const $=id=>document.getElementById(id);
$('year').textContent=new Date().getFullYear();
const hamburger=$('hamburger'),nav=$('nav');
hamburger.addEventListener('click',()=>{const on=nav.classList.toggle('open');hamburger.setAttribute('aria-expanded',String(on));hamburger.textContent=on?'×':'☰';});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');hamburger.setAttribute('aria-expanded','false');hamburger.textContent='☰';}));
let current=0,expanded=false,originalFocus=null;const dialog=$('lightbox');
function paintGallery(){
 const wrap=$('galleryGrid');wrap.replaceChildren();
 gallery.slice(0,expanded?gallery.length:3).forEach((item,i)=>{
   const b=document.createElement('button');b.className='gallery-card';b.type='button';b.setAttribute('aria-label','View '+item.title);
   const art=document.createElement('div');art.className='gallery-art';
   if(item.file){const img=document.createElement('img');img.src=item.file;img.alt=item.title;img.loading='lazy';img.style.cssText='display:block;width:100%;height:100%;object-fit:cover';art.append(img);}
   const caption=document.createElement('div');caption.className='gallery-caption';
   const name=document.createElement('span');name.textContent=item.title;
   const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0')+' / '+String(gallery.length).padStart(2,'0');
   caption.append(name,number);b.append(art,caption);b.addEventListener('click',()=>openGallery(i));wrap.append(b);
 });
 $('showAll').textContent=expanded?'SHOW LESS ↑':'VIEW FULL COLLECTION ↗';
}
function showImage(){const item=gallery[current],a=$('lightboxArtwork');a.replaceChildren();if(item.file){const img=document.createElement('img');img.src=item.file;img.alt=item.title;img.style.cssText='height:100%;width:100%;object-fit:contain';a.append(img);}a.style.background=item.file?'#1c0b14':`linear-gradient(${120+current*26}deg,#8f314a,#ddb0ad 43%,#3a0d1c)`;$('lightboxTitle').textContent=item.title+' · '+(current+1)+' / '+gallery.length;}
function openGallery(i){originalFocus=document.activeElement;current=i;showImage();dialog.showModal();}
function changeImage(diff){current=(current+diff+gallery.length)%gallery.length;showImage();}
$('showAll').addEventListener('click',()=>{expanded=!expanded;paintGallery();});
$('closeLightbox').addEventListener('click',()=>dialog.close());$('prevImage').addEventListener('click',()=>changeImage(-1));$('nextImage').addEventListener('click',()=>changeImage(1));
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
dialog.addEventListener('close',()=>originalFocus?.focus?.());
document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft')changeImage(-1);if(e.key==='ArrowRight')changeImage(1);});
paintGallery();
const video=$('featureVideo');if(FEATURE_VIDEO_ENABLED){video.addEventListener('loadedmetadata',()=>$('filmStage').classList.add('active'));video.load();}else{video.hidden=true;}
$('enquiry').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget,status=$('formStatus');if(!form.reportValidity())return;if(!OWNER_CONTACT_EMAIL){status.textContent='Enquiries are not yet active. The owner must approve a public contact address first.';return;}
 const data=new FormData(form),name=String(data.get('name')).trim(),email=String(data.get('email')).trim(),message=String(data.get('message')).trim();
 const subject=encodeURIComponent('MAMTU enquiry from '+name),body=encodeURIComponent('From: '+name+'\nReply email: '+email+'\n\n'+message);
 window.location.href='mailto:'+OWNER_CONTACT_EMAIL+'?subject='+subject+'&body='+body;
 status.textContent='Your email app should open now. Please send the prepared message there; the site does not submit or store it.';
});
/* Limited, local FAQ guide. No network calls, knowledge base, model or personal data storage. */
const assistToggle=$('assistantToggle'),assistPanel=$('assistantPanel'),assistClose=$('assistantClose'),assistForm=$('assistantForm'),assistLog=$('assistantLog');
function setAssist(open){assistPanel.hidden=!open;assistToggle.setAttribute('aria-expanded',String(open));if(open)$('assistantInput').focus();else assistToggle.focus();}
assistToggle.addEventListener('click',()=>setAssist(assistPanel.hidden));
assistClose.addEventListener('click',()=>setAssist(false));
function faqReply(question){
 const q=question.toLowerCase();
 if(/photo|image|picture|gallery|portrait|film|video/.test(q))return 'Explore the Gallery and Motion Archive on this page. The current artwork is illustrative; approved portraits and videos have not been supplied yet.';
 if(/contact|book|enquir|email|message|availability|rate|price|cost|service/.test(q))return 'You can preview the enquiry section, but contact details, availability, services and prices have not been verified by the owner. No bookings or messages can be submitted here yet.';
 if(/who|about|story|mamtu|location|where/.test(q))return 'MAMTU is a new editorial portfolio in development. An approved biography and location have not been provided. The Story section currently contains introductory design copy.';
 if(/privacy|data|store|save/.test(q))return 'This preview assistant responds locally in your browser. It does not send your questions to a server or store them. The enquiry form also does not collect or send data.';
 if(/hello|hi|hey|good morning/.test(q))return 'Welcome to MAMTU. Ask me about the gallery, upcoming film, enquiry process or how this preview handles privacy.';
 return 'I only have verified information about this website preview. Try asking about the gallery, contact, privacy or the story.';
}
assistForm.addEventListener('submit',e=>{e.preventDefault();const input=$('assistantInput'),question=input.value.trim();if(!question)return;const add=(v,role)=>{const p=document.createElement('p');p.className='assistant-bubble '+role;p.textContent=v;assistLog.append(p);};add(question,'from-user');add(faqReply(question),'from-assistant');input.value='';assistLog.scrollTop=assistLog.scrollHeight;});
