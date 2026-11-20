/* MAMTU preview — all imagery is original CSS artwork until client media is approved. */
const OWNER_CONTACT_EMAIL = ''; // Add owner-verified email; never invent.
const FEATURE_VIDEO_ENABLED = false; // Set true after assets/videos/feature.mp4 exists.
const gallery=[
 {title:'Crimson interlude',subtitle:'ART STUDY / 01',file:''},
 {title:'An elegant pause',subtitle:'ART STUDY / 02',file:''},
 {title:'Light & shadow',subtitle:'ART STUDY / 03',file:''},
 {title:'The quiet moment',subtitle:'ART STUDY / 04',file:''},
 {title:'Between the lines',subtitle:'ART STUDY / 05',file:''},
 {title:'A study in presence',subtitle:'ART STUDY / 06',file:''}
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