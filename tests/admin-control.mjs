import assert from "node:assert/strict";
import { applyAdminOverlay, defaultAdminState, sanitizeAdminState } from "../lib/admin-control.js";

const base = {
  profile: { base: "Saket, New Delhi", intro: "Intro" },
  practical: {
    residence: "Residence",
    personality: "Personality",
    physicalPresence: "Physical",
    hygiene: "Hygiene",
    photographs: "Photos"
  },
  pricing: {
    indicative: {
      incall1h: "From ₹40,000",
      incall2h: "From ₹70,000",
      outcall1h: "From ₹60,000",
      outcall2h: "From ₹1,00,000",
      fullNight: "Around ₹2,00,000",
      twoShots: "Around ₹1,00,000",
      threesomeNight: "Around ₹5,00,000",
      webcam30: "₹10,000 for 30 minutes"
    }
  },
  services: [
    { title: "Incall – 1 Hour", terms: "From ₹40,000" },
    { title: "Video Call / Webcam", terms: "₹10,000 / 30 min" }
  ],
  contact: {
    whatsappDisplay: "+91 836 841 0417",
    whatsappUrl: "https://wa.me/918368410417",
    telegramHandle: "@mistressmamtu",
    telegramUrl: "https://t.me/mistressmamtu"
  },
  afterhours: {}
};

const defaults = defaultAdminState(base);
assert.equal(defaults.rates.incall1h, "₹40,000");
assert.equal(defaults.rates.webcam30, "₹10,000");

const clean = sanitizeAdminState({
  ...defaults,
  rates: { ...defaults.rates, incall1h: "From ₹45,000" },
  contact: { ...defaults.contact, whatsappUrl: "javascript:alert(1)" },
  media: { ...defaults.media, homeImage1: "https://evil.example/image.jpg" }
}, base);

assert.equal(clean.rates.incall1h, "₹45,000");
assert.equal(clean.contact.whatsappUrl, defaults.contact.whatsappUrl);
assert.equal(clean.media.homeImage1, defaults.media.homeImage1);

const overlay = applyAdminOverlay(base, {
  ...defaults,
  contact: { ...defaults.contact, telegramHandle: "@newhandle" },
  rates: { ...defaults.rates, incall1h: "₹45,000" },
  assistant: { ...defaults.assistant, enabled: false }
});

assert.equal(overlay.contact.telegramHandle, "@newhandle");
assert.equal(overlay.pricing.indicative.incall1h, "₹45,000");
assert.equal(overlay.services[0].terms, "From ₹45,000");
assert.equal(overlay.runtime.assistant.enabled, false);
assert.equal(base.contact.telegramHandle, "@mistressmamtu");

console.log("Mamtu Control tests passed.");
