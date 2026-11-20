import { MAMTU_DATA } from "../data/mamtu-data.js";

const STOP_WORDS = new Set(["a","an","and","are","as","at","be","been","but","by","can","could","do","does","for","from","had","has","have","her","here","how","i","if","in","is","it","its","mamtu","me","my","of","on","or","our","please","she","so","that","the","their","them","there","they","this","to","us","was","we","what","when","where","which","who","why","will","with","would","you","your"]);

const SYNONYMS = {
  price:["pricing","rate","rates","cost","fees","charge","charges","how much"],
  prices:["pricing","rate","rates","cost"],
  cost:["price","pricing","rate","rates"],
  book:["booking","appointment","enquiry","contact","reserve"],
  booking:["book","appointment","enquiry","contact"],
  available:["availability","appointment","contact","free","tonight","today"],
  availability:["available","appointment","contact"],
  service:["services","appointment","meeting"],
  services:["service","appointment","meeting"],
  photo:["photos","gallery","picture","pictures","pic","pics","image","images"],
  photos:["photo","gallery","pictures","pics"],
  video:["videos","film","films","clip","clips","webcam","cam"],
  videos:["video","films","clips"],
  review:["reviews","testimonial","feedback"],
  reviews:["review","testimonial","feedback"],
  whatsapp:["contact","message","phone","wa"],
  telegram:["contact","message","tg"],
  afterhours:["updates","telegram","contact"],
  like:["likes","style","personality","values"],
  personality:["about","values","style","nature"],
  privacy:["private","address","boundaries","discretion"],
  address:["privacy","private","location","where"],
  location:["base","saket","delhi","gurgaon","noida","ncr","where"],
  dinner:["social","service","conversation","date"],
  outcall:["location","service","hotel","visit","come"],
  incall:["incall","private","place","home","flat"],
  extended:["service","unhurried","longer"],
  overnight:["night","full","stay","sleepover"],
  gfe:["girlfriend","companionship","experience","affection","cuddle"],
  massage:["sensory","tantric","body","body-to-body"],
  roleplay:["role","fantasy","play","teacher","maid","boss"],
  webcam:["video","digital","online","cam","call"],
  oral:["blowjob","bj","sucking","mouth"],
  sex:["fuck","fucking","intercourse","intimate","intimacy","full service"],
  kissing:["kiss","makeout"],
  anal:["greek","a-level","backdoor"],
  threesome:["duo","two girl","fff","mff"],
  body:["figure","measurements","boobs","ass","curves","size"],
  hygiene:["clean","checkup","health","safe"],
  condom:["protection","safe","unprotected","bare"],
  face:["verification","photo","pics","real"],
  real:["genuine","photoshop","fake","authentic"]
};

export function buildMamtuKnowledge(data = MAMTU_DATA) {
  const p = data.profile;
  const c = data.contact;
  const svc = data.services;
  const g = data.gallery;
  const v = data.videos;
  const pr = data.pricing;
  const intimacy = data.intimacy || {};
  const practical = data.practical || {};

  const faqText = (p.faq || []).map(x => x.question + " " + x.answer).join(" ");

  return [
    {
      id: "profile-core",
      title: "Mamtu — public profile",
      path: "/about.html",
      tags: ["about","profile","base","saket","delhi","personality","style","values","independent","who"],
      text: p.intro + " " + (p.about || []).join(" ")
    },
    {
      id: "profile-personality",
      title: "Mamtu — personality, languages and appearance",
      path: "/about.html",
      tags: ["personality","style","values","playful","friendly","outgoing","confident","privacy","respect","figure","body","measurements","english","hindi","language","look","appearance"],
      text: "Personality: " + (p.personality || []).join(", ") + ". Style: " + (p.style || []).join(", ") + ". Values: " + (p.values || []).join(", ") + ". Languages: " + (p.languages || []).join(", ") + ". Physical: " + (p.physical ? p.physical.figure + " — " + p.physical.notes : "") + "."
    },
    {
      id: "profile-faq",
      title: "Mamtu — full FAQ",
      path: "/about.html",
      tags: ["faq","questions","first message","pricing","availability","location","oral","sex","kissing","anal","gfe","massage","roleplay","webcam","threesome","hygiene","rules","booking","advance","hotel","real","photos","face","verification","contact","whatsapp","telegram"],
      text: faqText
    },
    {
      id: "intimacy",
      title: "Mamtu — intimacy and what is included",
      path: "/services.html",
      tags: ["sex","intimate","intimacy","oral","blowjob","bj","kissing","kiss","anal","greek","cum","face","body","pussy","fuck","fucking","full service","gfe","massage","roleplay","boundaries","included","not offered"],
      text: (intimacy.summary || "") + " Included: " + (intimacy.included || []).join("; ") + ". Not offered: " + (intimacy.notOffered || []).join("; ") + ". " + (intimacy.notes || "")
    },
    {
      id: "site-index",
      title: "Mamtu — website coverage",
      path: "/",
      tags: ["website","pages","help","overview","everything"],
      text: "The public website covers Mamtu's profile, growing photo gallery, personal videos, services with clear starting rates, honest review policy, official contact routes and Mamtu Afterhours. The assistant can answer questions from the public knowledge base."
    },
    {
      id: "services",
      title: "Mamtu — services list",
      path: "/services.html",
      tags: ["services","private","social","dinner","outcall","incall","overnight","extended","occasion","tailored","appointment","gfe","girlfriend","sensory","massage","roleplay","webcam","threesome","two shots","video call"],
      text: svc.map(x => x.title + ": " + x.summary + " " + x.terms + (x.details ? " " + x.details : "")).join(" ")
    },
    {
      id: "pricing",
      title: "Pricing and arrangements",
      path: "/services.html",
      tags: ["price","prices","pricing","rate","rates","cost","fees","how much","incall","outcall","night","webcam","charge","advance","negotiable","budget"],
      text: pr.philosophy + " Indicative ranges: Incall 1h " + pr.indicative.incall1h + ", Incall 2h " + pr.indicative.incall2h + ", Outcall 1h " + pr.indicative.outcall1h + ", Outcall 2h " + pr.indicative.outcall2h + ", Full night " + pr.indicative.fullNight + ", Two shots " + pr.indicative.twoShots + ", Threesome night " + pr.indicative.threesomeNight + ", Webcam " + pr.indicative.webcam30 + ". " + (pr.notes || []).join(" ")
    },
    {
      id: "availability",
      title: "Current availability",
      path: "/contact.html",
      tags: ["available","availability","today","tonight","tomorrow","book","booking","appointment","hours","schedule"],
      text: "The website does not publish or guarantee live availability. Mamtu confirms current availability herself through official WhatsApp or Telegram. There are no fixed public working hours."
    },
    {
      id: "gallery",
      title: "Mamtu — growing gallery",
      path: "/gallery.html",
      tags: ["gallery","photos","photo","pictures","mirror","airport","denim","traditional","collage","real","genuine","photoshop"],
      text: g.summary + " Currently " + g.currentCount + " images. " + (g.stories || []).map(x => x.title + ": " + x.summary).join(" ")
    },
    {
      id: "videos",
      title: "Mamtu — personal videos",
      path: "/videos.html",
      tags: ["videos","video","films","motion","clips","webcam"],
      text: v.summary + " Currently " + v.currentCount + " clips."
    },
    {
      id: "reviews",
      title: "Mamtu — review policy",
      path: "/reviews.html",
      tags: ["reviews","review","feedback","testimonial","trust","real"],
      text: data.reviews.policy + " There are currently no public reviews published on the website."
    },
    {
      id: "practical",
      title: "Mamtu — practical details",
      path: "/about.html",
      tags: ["details","practical","residence","figure","hygiene","checkup","photos","verification","hotel","standards","minimum","budget","manners","language","english","hindi"],
      text: [practical.residence, practical.personality, practical.physicalPresence, practical.hygiene, practical.photographs, practical.languages, ...(practical.standards || []), practical.contactGuidance, practical.reusePolicy].filter(Boolean).join(" ")
    },
    {
      id: "privacy",
      title: "Privacy, rules and boundaries",
      path: "/about.html",
      tags: ["privacy","private","address","location","boundaries","documents","sensitive","rules","recording","photo","consent","discretion","blocked","time waste"],
      text: (data.policies.privacy || []).join(" ") + " " + (data.policies.communication || []).join(" ") + " " + (data.policies.standards || []).join(" ")
    },
    {
      id: "afterhours",
      title: "Mamtu Afterhours",
      path: "/",
      tags: ["afterhours","stay close","telegram","updates","follow","contact"],
      text: data.afterhours.title + ". " + data.afterhours.body + " Primary public route: " + data.afterhours.primaryLabel + " " + data.afterhours.primaryDetail + " at " + data.afterhours.primaryUrl + "."
    },
    {
      id: "contact",
      title: "Official contact",
      path: "/contact.html",
      tags: ["contact","whatsapp","telegram","phone","message","enquiry","booking","number","handle"],
      text: "Official WhatsApp: " + c.whatsappDisplay + " at " + c.whatsappUrl + ". Official Telegram: " + c.telegramHandle + " at " + c.telegramUrl + ". Live availability is confirmed directly by " + c.liveAvailabilityOwner + "."
    }
  ];
}

export const MAMTU_KNOWLEDGE = buildMamtuKnowledge();

function normalize(text = "") {
  return String(text).toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function queryTerms(query = "") {
  const terms = new Set();
  const add = (token) => {
    if (!token || token.length < 2 || STOP_WORDS.has(token)) return;
    terms.add(token);
    for (const s of SYNONYMS[token] || []) terms.add(s);
  };
  for (const token of normalize(query).split(" ").filter(Boolean)) {
    add(token);
    if (token.length > 4 && token.endsWith("ies")) add(token.slice(0, -3) + "y");
    if (token.length > 4 && token.endsWith("ing")) add(token.slice(0, -3));
    if (token.length > 3 && token.endsWith("ed")) add(token.slice(0, -2));
    if (token.length > 3 && token.endsWith("s")) add(token.slice(0, -1));
  }
  return [...terms];
}

function scoreChunk(chunk, terms, page = "") {
  const tags = normalize(chunk.tags.join(" "));
  const title = normalize(chunk.title);
  const body = normalize(chunk.text);
  const tagTokens = new Set(tags.split(" "));
  const titleTokens = new Set(title.split(" "));
  let score = chunk.path === page ? 8 : 0;
  for (const term of terms) {
    if (tagTokens.has(term)) score += 9;
    else if (tags.includes(term)) score += 5;
    if (titleTokens.has(term)) score += 7;
    else if (title.includes(term)) score += 4;
    score += Math.min(body.split(term).length - 1, 5);
  }
  return score;
}

export function retrieveMamtuKnowledge(query, limit = 8, data = MAMTU_DATA, { page = "" } = {}) {
  const knowledge = buildMamtuKnowledge(data);
  const terms = queryTerms(query);
  const ranked = knowledge.map(chunk => ({ ...chunk, score: scoreChunk(chunk, terms, page) })).sort((a, b) => b.score - a.score);
  const chosen = [];
  const seen = new Set();
  const add = (chunk) => {
    if (chunk && !seen.has(chunk.id)) {
      seen.add(chunk.id);
      chosen.push(chunk);
    }
  };
  ranked.filter(x => x.score > 0).slice(0, Math.max(1, limit - 3)).forEach(add);
  ["site-index", "profile-core", "profile-personality", "profile-faq"].forEach(id => add(knowledge.find(x => x.id === id)));
  for (const chunk of ranked) {
    if (chosen.length >= limit) break;
    if (chunk.score > 0) add(chunk);
  }
  if (!chosen.length) ["profile-core", "profile-personality", "site-index", "contact"].forEach(id => add(knowledge.find(x => x.id === id)));
  return chosen.slice(0, Math.max(limit, 4));
}

export function formatMamtuContext(chunks) {
  return chunks.map((c, i) => `[${i + 1}] ${c.title} (${c.path})\n${c.text}`).join("\n\n");
}
