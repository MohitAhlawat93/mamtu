import { MAMTU_DATA } from "../data/mamtu-data.js";

const STOP_WORDS=new Set(["a","an","and","are","as","at","be","been","but","by","can","could","do","does","for","from","had","has","have","her","here","how","i","if","in","is","it","its","mamtu","me","my","of","on","or","our","please","she","so","that","the","their","them","there","they","this","to","us","was","we","what","when","where","which","who","why","will","with","would","you","your"]);
const SYNONYMS={
  price:["pricing","rate","rates","cost","fees"],prices:["pricing","rate","rates","cost"],cost:["price","pricing","rate","rates"],
  book:["booking","appointment","enquiry","contact"],booking:["book","appointment","enquiry","contact"],available:["availability","appointment","contact"],
  availability:["available","appointment","contact"],service:["services","appointment"],services:["service","appointment"],
  photo:["photos","gallery","picture","pictures"],photos:["photo","gallery","pictures"],video:["videos","film","films"],videos:["video","films"],
  review:["reviews","testimonial","feedback"],reviews:["review","testimonial","feedback"],real:["reviews","gallery","profile"],
  whatsapp:["contact","message","phone"],telegram:["contact","message","afterhours"],afterhours:["updates","telegram","contact"],
  like:["likes","style","personality","values"],likes:["style","personality","values"],personality:["about","values","style"],
  privacy:["private","address","boundaries"],address:["privacy","private","location"],location:["base","saket","delhi","contact"],
  dinner:["social","service","conversation"],outcall:["location","service","hotel"],extended:["service","unhurried"],tailored:["personal","service"],
  gfe:["girlfriend","companionship","experience"],massage:["sensory","tantric","body"],roleplay:["role","fantasy","play"],webcam:["video","digital","online"],
  incall:["incall","private","place"],overnight:["night","full","stay"]
};

export function buildMamtuKnowledge(data=MAMTU_DATA){
  const p=data.profile,c=data.contact,svc=data.services,g=data.gallery,v=data.videos,pr=data.pricing;
  return [
    {id:"profile-core",title:"Mamtu — public profile",path:"/about.html",tags:["about","profile","base","saket","delhi","personality","style","values"],text:p.intro+" "+p.about.join(" ")},
    {id:"profile-personality",title:"Mamtu — personality and values",path:"/about.html",tags:["personality","style","values","playful","friendly","outgoing","confident","privacy","respect","figure"],text:"Public personality: "+p.personality.join(", ")+". Public style: "+p.style.join(", ")+". Values: "+p.values.join(", ")+". Physical: "+(p.physical?p.physical.figure+" — "+p.physical.notes:"")+"."},
    {id:"profile-faq",title:"Mamtu — public FAQ",path:"/about.html",tags:["faq","questions","first message","pricing","availability","location"],text:p.faq.map(x=>x.question+" "+x.answer).join(" ")},
    {id:"site-index",title:"Mamtu — website coverage",path:"/",tags:["website","pages","help","overview","everything"],text:"The public website covers Mamtu's profile, growing photo gallery, personal videos, services with clear starting rates, honest review policy, official contact routes and Mamtu Afterhours. Practical profile details are available through Mamtu Assistant."},
    {id:"services",title:"Mamtu — services",path:"/services.html",tags:["services","private","social","dinner","outcall","incall","overnight","extended","occasion","tailored","appointment","gfe","girlfriend","sensory","massage","roleplay","webcam","threesome"],text:svc.map(x=>x.title+": "+x.summary+" "+x.terms+(x.details?" "+x.details:"")).join(" ")},
    {id:"pricing",title:"Pricing and arrangements",path:"/services.html",tags:["price","prices","pricing","rate","rates","cost","fees","how much","incall","outcall","night","webcam"],text:pr.philosophy+" Indicative ranges: Incall 1h from "+pr.indicative.incall1h+", Incall 2h from "+pr.indicative.incall2h+", Outcall 1h from "+pr.indicative.outcall1h+", Outcall 2h from "+pr.indicative.outcall2h+", Full night from "+pr.indicative.fullNight+", Two shots around "+pr.indicative.twoShots+", Threesome night around "+pr.indicative.threesomeNight+", Webcam "+pr.indicative.webcam30+". "+pr.notes.join(" ")},
    {id:"availability",title:"Current availability",path:"/contact.html",tags:["available","availability","today","tonight","tomorrow","book","booking","appointment"],text:"The website does not publish or guarantee live availability. Mamtu confirms current availability herself through her official WhatsApp or Telegram."},
    {id:"gallery",title:"Mamtu — growing gallery",path:"/gallery.html",tags:["gallery","photos","photo","pictures","mirror","airport","denim","traditional","collage"],text:g.summary+" The public page currently displays "+g.currentCount+" uploaded images, but the gallery is explicitly designed to grow. "+g.stories.map(x=>x.title+": "+x.summary).join(" ")},
    {id:"videos",title:"Mamtu — personal videos",path:"/videos.html",tags:["videos","video","films","motion","clips"],text:v.summary+" It currently displays "+v.currentCount+" uploaded clips, without fixed public numbering."},
    {id:"reviews",title:"Mamtu — review policy",path:"/reviews.html",tags:["reviews","review","feedback","testimonial","trust","real"],text:data.reviews.policy+" There are currently no public reviews published on the website."},
    {id:"practical",title:"Mamtu — practical details",path:"/about.html",tags:["details","practical","residence","figure","hygiene","checkup","photos","verification","hotel","standards","minimum","budget","manners"],text:[data.practical?.residence,data.practical?.personality,data.practical?.physicalPresence,data.practical?.hygiene,data.practical?.photographs,...(data.practical?.standards||[]),data.practical?.contactGuidance,data.practical?.reusePolicy].filter(Boolean).join(" ")},
    {id:"privacy",title:"Privacy and boundaries",path:"/about.html",tags:["privacy","private","address","location","boundaries","documents","sensitive"],text:data.policies.privacy.join(" ")+" "+data.policies.communication.join(" ")+" "+(data.policies.standards?data.policies.standards.join(" "):"")},
    {id:"afterhours",title:"Mamtu Afterhours",path:"/",tags:["afterhours","stay close","telegram","updates","follow","contact"],text:data.afterhours.title+". "+data.afterhours.body+" Primary public route: "+data.afterhours.primaryLabel+" "+data.afterhours.primaryDetail+" at "+data.afterhours.primaryUrl+"."},
    {id:"contact",title:"Official contact",path:"/contact.html",tags:["contact","whatsapp","telegram","phone","message","enquiry","booking"],text:"Official WhatsApp: "+c.whatsappDisplay+" at "+c.whatsappUrl+". Official Telegram: "+c.telegramHandle+" at "+c.telegramUrl+". Live availability is confirmed directly by "+c.liveAvailabilityOwner+"."}
  ];
}
export const MAMTU_KNOWLEDGE=buildMamtuKnowledge();

function normalize(text=""){return String(text).toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim()}
function queryTerms(query=""){
  const terms=new Set();
  const add=(token)=>{if(!token||token.length<2||STOP_WORDS.has(token))return;terms.add(token);for(const s of SYNONYMS[token]||[])terms.add(s)};
  for(const token of normalize(query).split(" ").filter(Boolean)){
    add(token);
    if(token.length>4&&token.endsWith("ies"))add(token.slice(0,-3)+"y");
    if(token.length>4&&token.endsWith("ing"))add(token.slice(0,-3));
    if(token.length>3&&token.endsWith("ed"))add(token.slice(0,-2));
    if(token.length>3&&token.endsWith("s"))add(token.slice(0,-1));
  }
  return [...terms];
}
function scoreChunk(chunk,terms,page=""){
  const tags=normalize(chunk.tags.join(" ")),title=normalize(chunk.title),body=normalize(chunk.text);
  const tagTokens=new Set(tags.split(" ")),titleTokens=new Set(title.split(" "));
  let score=chunk.path===page?8:0;
  for(const term of terms){
    if(tagTokens.has(term))score+=9;else if(tags.includes(term))score+=5;
    if(titleTokens.has(term))score+=7;else if(title.includes(term))score+=4;
    score+=Math.min(body.split(term).length-1,5);
  }
  return score;
}
export function retrieveMamtuKnowledge(query,limit=8,data=MAMTU_DATA,{page=""}={}){
  const knowledge=buildMamtuKnowledge(data),terms=queryTerms(query);
  const ranked=knowledge.map(chunk=>({...chunk,score:scoreChunk(chunk,terms,page)})).sort((a,b)=>b.score-a.score);
  const chosen=[],seen=new Set();const add=chunk=>{if(chunk&&!seen.has(chunk.id)){seen.add(chunk.id);chosen.push(chunk)}};
  ranked.filter(x=>x.score>0).slice(0,Math.max(1,limit-3)).forEach(add);
  ["site-index","profile-core","profile-personality"].forEach(id=>add(knowledge.find(x=>x.id===id)));
  for(const chunk of ranked){if(chosen.length>=limit)break;if(chunk.score>0)add(chunk)}
  if(!chosen.length)["profile-core","profile-personality","site-index","contact"].forEach(id=>add(knowledge.find(x=>x.id===id)));
  return chosen.slice(0,Math.max(limit,4));
}
export function formatMamtuContext(chunks){return chunks.map((c,i)=>`[${i+1}] ${c.title} (${c.path})\n${c.text}`).join("\n\n")}
