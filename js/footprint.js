let model = null;
let appConfig = null;

// --- 1. ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ ---

// Χρησιμοποιούμε safeFmt για να μην συγκρούεται με το fmt του common.js
const safeFmt = (typeof fmt !== 'undefined') ? fmt : (n) => (n || 0).toFixed(2);

function val(x) {
  if (x === null || x === undefined) return 0;
  if (typeof x === "number") return x;
  if (typeof x === "object" && "value" in x) return Number(x.value) || 0;
  return Number(x) || 0;
}

// Helper για ανάγνωση overrides από τα settings
function getEffectiveNumber(key, fallback) {
  try {
    const enabled = localStorage.getItem(key + "_OVERRIDE_ENABLED") === "1";
    if (enabled) {
      const v = Number(localStorage.getItem(key + "_OVERRIDE_VALUE"));
      if (Number.isFinite(v)) return v;
    }
    if (appConfig && typeof appConfig[key] !== "undefined") {
      const v = Number(appConfig[key]);
      if (Number.isFinite(v)) return v;
    }
  } catch (e) {}
  return fallback;
}

// Helper για ανάγνωση ετικετών από το UI του μοντέλου
function getUILabel(dim) {
  const lang = (window.getLang) ? window.getLang() : "el";
  return (model && model.ui && model.ui[dim] && model.ui[dim].labels) ? model.ui[dim].labels[lang] : null;
}

function getUIOrder(dim) {
  return (model && model.ui && model.ui[dim] && Array.isArray(model.ui[dim].order)) ? model.ui[dim].order : [];
}

// --- 2. ΚΕΙΜΕΝΑ ΚΑΙ ΜΕΤΑΦΡΑΣΕΙΣ (Πλήρεις Τίτλοι) ---

function T() {
  const lang = (window.getLang) ? window.getLang() : "el";
  return {
    el: {
      title: "Εκτίμηση Αποτυπώματος CO₂",
      subtitle: "Τα αποτελέσματα είναι προσεγγιστικά. Δες την Τεκμηρίωση για λεπτομέρειες.",
      home: "Κατοικία",
      transport: "Μεταφορές",
      lifestyle: "Τρόπος Ζωής - Διατροφή",
      labels: {
        homeType: "Τύπος κατοικίας",
        homeCond: "Μόνωση / κατάσταση",
        heating: "Θέρμανση",
        occupants: "Άτομα στο σπίτι",
        solarDHW: "Ηλιακός θερμοσίφωνας",
        homeUse: "Χρήση ηλεκτρικής ενέργειας (εκτός θέρμανσης)",
        weeklyKm: "Διανυόμενα χιλιόμετρα (εβδομαδιαίως)",
        carType: "Κύριο μέσο μετακίνησης",
        publicTransport: "Είδος δημόσιας συγκοινωνίας",
        publicPct: "Ποσοστό χρήσης δημόσιων μέσων",
        alone: "Μετακινούμαι μόνος",
        flightsDomestic: "Πτήσεις εντός Ελλάδας (ανά έτος)",
        flightsEurope: "Πτήσεις εντός Ευρώπης (ανά έτος)",
        diet: "Διατροφή",
        goodsProfile: "Κατανάλωση προϊόντων (Ρούχα, ηλεκτρονικά, αγορές & lifestyle)",
        digitalLevel: "Ψηφιακή κατανάλωση (internet/cloud)",
        socialShare: "Δημόσιες υποδομές",
        calc: "Υπολόγισε",
        dash: "Διαγράμματα",
        total: "Σύνολο",
        digitalMin: "Χαμηλή (Email, Web)",
        digitalMid: "Μεσαία (Social, Cloud)",
        digitalMax: "Υψηλή (Streaming, AI)"
      },
      units: {
        socialShare: "kg CO₂/έτος"
      }
    },
    en: {
      title: "Carbon Footprint Calculator",
      subtitle: "Results are approximate. See Documentation for details.",
      home: "Home",
      transport: "Transport",
      lifestyle: "Lifestyle & Diet",
      labels: {
        homeType: "Home type",
        homeCond: "Insulation / condition",
        heating: "Heating",
        occupants: "Occupants",
        solarDHW: "Solar water heater",
        homeUse: "Electricity use (excluding heating)",
        weeklyKm: "Weekly distance (km)",
        carType: "Main transport mode",
        publicTransport: "Public transport type",
        publicPct: "Share of public transport",
        alone: "I travel alone",
        flightsDomestic: "Domestic flights (year)",
        flightsEurope: "Intl flights (year)",
        diet: "Diet",
        goodsProfile: "Goods consumption (Clothes, electronics, lifestyle)",
        digitalLevel: "Digital consumption",
        socialShare: "Public services",
        calc: "Calculate",
        dash: "Dashboard",
        total: "Total",
        digitalMin: "Low (Email, Web)",
        digitalMid: "Medium (Social, Cloud)",
        digitalMax: "High (Streaming, AI)"
      },
      units: {
        socialShare: "kg CO₂/year"
      }
    }
  } [lang];
}

// --- 3. LOGIC & CALCULATIONS ---

function piecewiseSliderToAnchor(sliderVal, anchors) {
  const x = Math.max(0, Math.min(100, Number(sliderVal)));
  const a0 = anchors.min ?? anchors.low ?? 0;
  const a1 = anchors.typical ?? anchors.medium ?? 0;
  const a2 = anchors.max ?? anchors.high ?? 0;
  if (x <= 50) return a0 + (a1 - a0) * (x / 50);
  return a1 + (a2 - a1) * ((x - 50) / 50);
}

function compute() {
  if (!model) return {
    totalTons: 0,
    homeValues: [],
    transportValues: [],
    lifestyleValues: [],
    homeTons: 0,
    transportTons: 0,
    lifestyleTons: 0
  };

  const b = model.base || {};
  const f = model.factors || {};
  const c = model.constants || {};
  const p = model.parameters || {};

  const gridCI = getEffectiveNumber("gridCI_kgCO2_per_kWh", val(p.gridCI_kgCO2_per_kWh));

  // --- HOME CALCULATION ---
  const homeCondEl = document.getElementById("homeCond");
  const homeCondIdx = homeCondEl ? Number(homeCondEl.value) : 1;
  const condKeys = model.ui?.homeCondition?.order || ["modern", "partial", "none"];
  const homeCond = condKeys[homeCondIdx] || "partial";

  const aptKWh = Number(b.heatingDemandKWhApartment?.value?.[homeCond] ?? 0);
  const homeTypeMult = val(f.homeType?.[document.getElementById("homeType").value] ?? 1);
  const heatIntensity = val(f.heatingType?.[document.getElementById("heatingType").value] ?? 0);
  const heatingTons = ((aptKWh * homeTypeMult) / 1000) * heatIntensity;

  const occ = Number(document.getElementById("occupants").value) || 1;
  const solar = document.getElementById("solarDHW").checked;
  const dhwPerPerson = solar ? val(b.dhwBackupKWhPerPersonPerYear) : val(b.dhwKWhPerPersonPerYear);
  const dhwTons = (occ * dhwPerPerson * gridCI) / 1000;

  const homeUseVal = Number(document.getElementById("homeUseLevel").value);
  const elecAnchors = b.homeOtherElectricityAnchorsKWhPerYear?.value || {
    min: 0,
    typical: 0,
    max: 0
  };
  const otherTons = (piecewiseSliderToAnchor(homeUseVal, elecAnchors) * gridCI) / 1000;

  const homeTons = heatingTons + dhwTons + otherTons;

  // --- TRANSPORT CALCULATION ---
  const weeklyKm = Number(document.getElementById("weeklyKm").value) || 0;
  const pubPct = Number(document.getElementById("publicPct").value) || 0;
  const kmPublic = Math.min(weeklyKm, pubPct);
  const kmCar = Math.max(0, weeklyKm - kmPublic);

  const alone = document.getElementById("alone").checked;
  const carType = document.getElementById("carType").value;
  let carEf = val(f.carType?.[carType]);
  
  if (carType === "electric") {
    carEf = gridCI * val(p.evConsumption_kWh_per_km);
  }

  let carTons = (kmCar * val(c.weeklyToTonsFactor) * carEf);
  if (!alone) carTons /= 2;

  const pubType = document.getElementById("publicType").value;
  let pubEf = val(f.publicTransport?.[pubType]);
  
  if (pubType === "metro") {
    pubEf = gridCI * getEffectiveNumber("metro_tram_kWh_per_pkm", val(p.metro_tram_kWh_per_pkm));
  }
  const pubTons = (kmPublic * val(c.weeklyToTonsFactor) * pubEf);

  const flDom = Number(document.getElementById("flightTripsDomestic").value) || 0;
  const flEu = Number(document.getElementById("flightTripsEurope").value) || 0;
  const flTons = ((flDom * val(c.flightTripDistanceKmDomestic) * val(c.flightKgPerKmPerPassenger)) +
    (flEu * val(c.flightTripDistanceKmEurope) * val(c.flightKgPerKmPerPassenger))) / 1000;

  const transportTons = carTons + pubTons + flTons;

  // --- LIFESTYLE CALCULATION ---
  const diet = document.getElementById("diet").value;
  const dietTons = (val(b.dietKgCO2PerYear_unit) * val(f.diet?.[diet])) / 1000;

  const goodsLvl = Number(document.getElementById("goodsLevel").value);
  const goodsFactor = 0.4 + (goodsLvl / 100) * 1.8;
  const goodsTons = (val(b.goodsKgCO2PerYear_unit) * goodsFactor) / 1000;

  const digLvl = Number(document.getElementById("digitalLevel").value);
  const digAnchors = {
    low: val(f.digitalLevel?.low),
    medium: val(f.digitalLevel?.medium),
    high: val(f.digitalLevel?.high)
  };
  const digTons = (val(b.digitalKgCO2PerYear_unit) * piecewiseSliderToAnchor(digLvl, digAnchors)) / 1000;

  const socialTons = getEffectiveNumber("socialShare_tCO2_per_year", val(b.socialShareKgCO2PerYear) / 1000);

  const lifestyleTons = dietTons + goodsTons + digTons + socialTons;

  return {
    totalTons: homeTons + transportTons + lifestyleTons,
    homeTons,
    transportTons,
    lifestyleTons,
    homeValues: [heatingTons, dhwTons, otherTons],
    transportValues: [
        carTons, 
        pubTons, 
        (flDom * val(c.flightTripDistanceKmDomestic) * val(c.flightKgPerKmPerPassenger)) / 1000, 
        (flEu * val(c.flightTripDistanceKmEurope) * val(c.flightKgPerKmPerPassenger)) / 1000
    ],
    lifestyleValues: [dietTons, goodsTons, digTons, socialTons]
  };
}

// --- 4. UI UPDATE & INITIALIZATION ---

function populateSelects() {
  if (!model) return;
  const populate = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    (model.ui?.[key]?.order || []).forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = model.ui?.[key]?.labels?.[window.getLang ? window.getLang() : "el"]?.[k] || k;
      el.appendChild(opt);
    });
  };
  populate("homeType", "homeType");
  populate("heatingType", "heatingType");
  populate("occupants", "occupants");
  populate("carType", "carType");
  populate("publicType", "publicTransport");
  populate("diet", "diet");
}

function updateUI() {
  const res = compute();
  const t = T();
  const lang = (window.getLang) ? window.getLang() : "el";

  // KPI Headers
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = safeFmt(v); };
  setTxt("homeKpi", res.homeTons);
  setTxt("trKpi", res.transportTons);
  setTxt("lifeKpi", res.lifestyleTons);
  setTxt("totalVal", res.totalTons);

  setTxt("socialShareVal", safeFmt(getEffectiveNumber("socialShare_tCO2_per_year", 1.2) * 1000, 0) + " " + t.units.socialShare);

  // Navigation Pills
  const updateNavBtn = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      const valSpan = el.querySelector(".navVal");
      if (valSpan) valSpan.textContent = safeFmt(val);
    }
  };
  updateNavBtn("navHome", res.homeTons);
  updateNavBtn("navTransport", res.transportTons);
  updateNavBtn("navLifestyle", res.lifestyleTons);

  // --- ΕΠΑΝΑΦΟΡΑ ΕΠΕΞΗΓΗΣΕΩΝ (LABELS) ---

  // 1. Home Condition
  const homeCondEl = document.getElementById("homeCond");
  const homeCondLabel = document.getElementById("homeCondLabel");
  if (homeCondEl && homeCondLabel) {
    const order = getUIOrder("homeCondition");
    const labels = getUILabel("homeCondition") || {};
    const idx = Math.max(0, Math.min(order.length - 1, Math.round(Number(homeCondEl.value) || 0)));
    const key = order[idx];
    homeCondLabel.textContent = labels[key] ?? String(key);
  }

  // 2. Home Electricity Use
  const homeUseEl = document.getElementById("homeUseLevel");
  const homeUseLabel = document.getElementById("homeUseLabel");
  if (homeUseEl && homeUseLabel) {
    const v = Number(homeUseEl.value);
    const labels = getUILabel("homeUseLevel") || {};
    const key = (v < 33) ? "min" : (v > 66) ? "max" : "typical";
    homeUseLabel.textContent = labels[key] ?? "";
  }

  // 3. Goods Consumption
  const goodsEl = document.getElementById("goodsLevel");
  const goodsLabel = document.getElementById("goodsLabel");
  if (goodsEl && goodsLabel) {
    const v = Number(goodsEl.value);
    const labels = getUILabel("goodsLevel4") || {};
    const key = (v < 17) ? "lvl0" : (v < 50) ? "lvl1" : (v < 84) ? "lvl2" : "lvl3";
    goodsLabel.textContent = labels[key] ?? "";
  }

  // 4. Digital Consumption
  const digEl = document.getElementById("digitalLevel");
  const digLabel = document.getElementById("digitalLabel");
  if (digEl && digLabel) {
    const v = Number(digEl.value);
    // Προσπάθεια ανάγνωσης από το μοντέλο JSON
    const labels = getUILabel("digitalLevel") || {};
    let txt = "";
    if (Object.keys(labels).length > 0) {
       txt = (v < 33) ? labels.low : (v > 66) ? labels.high : labels.medium;
    } 
    // Fallback στις μεταφράσεις του T() αν δεν υπάρχουν στο JSON
    if (!txt) {
       txt = (v < 33) ? t.labels.digitalMin : (v > 66) ? t.labels.digitalMax : t.labels.digitalMid;
    }
    digLabel.textContent = txt;
  }

  // 5. Public Transport KM badge
  const wkKm = Number(document.getElementById("weeklyKm").value) || 0;
  const pubR = document.getElementById("publicPct");
  if (pubR) {
    pubR.max = wkKm;
    const km = Math.min(wkKm, Number(pubR.value));
    const valEl = document.getElementById("publicKmVal");
    if (valEl) valEl.textContent = `${Math.round(km)} km`;
  }

  // --- ΕΠΑΝΑΦΟΡΑ ΣΤΟΧΟΥ Ε.Ε. ---
  const target = getEffectiveNumber("euTarget_tCO2_per_year", (model && model.targets ? val(model.targets.euTargetTonsPerYear) : 2.5));
  const rp = document.getElementById("reducePct");
  if (rp) {
    if (res.totalTons > target) {
      const pct = Math.max(0, (1 - (target / res.totalTons)) * 100);
      rp.textContent = (lang === "en")
        ? `Needed reduction to reach EU target (${safeFmt(target)} t/yr): ${safeFmt(pct, 0)}%`
        : `Απαιτούμενη μείωση για τον στόχο ΕΕ (${safeFmt(target)} t/έτος): ${safeFmt(pct, 0)}%`;
      rp.style.color = "#d9534f"; // Κόκκινο
    } else {
      rp.textContent = (lang === "en")
        ? `You are at or below the EU target (${safeFmt(target)} t/yr).`
        : `Είσαι εντός στόχου ΕΕ (${safeFmt(target)} t/έτος).`;
      rp.style.color = "#5cb85c"; // Πράσινο
    }
  }
}

// --- MAIN EVENT LISTENER ---

document.addEventListener("DOMContentLoaded", async () => {
  if (window.initLangButtons) initLangButtons();

  // Load Config
  try {
    const cReq = await fetch("../config.json?v=" + Date.now());
    if (cReq.ok) appConfig = await cReq.json();
  } catch (e) {}

  // Load Model
  try {
    const mReq = await fetch("../assets/footprintModel_final_draft.json?v=" + Date.now());
    if (mReq.ok) {
      model = await mReq.json();
      populateSelects();

      const t = T();
      const setText = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
      };
      
      // Set Labels
      setText("title", t.title);
      setText("subtitle", t.subtitle);
      setText("homeTitle", t.home);
      setText("trTitle", t.transport);
      setText("lifeTitle", t.lifestyle);

      // Setup Navigation Buttons
      const setupNav = (btnId, label, targetCardId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.innerHTML = `
            <div style="font-size:0.85em; opacity:0.9; line-height:1.2;">${label}</div>
            <div style="font-weight:bold; font-size:1.1em; line-height:1.2;">
              <span class="navVal">-</span> <span style="font-size:0.8em">t</span>
            </div>
          `;
          btn.addEventListener("click", () => {
            const card = document.getElementById(targetCardId);
            if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          });
        }
      };

      setupNav("navHome", t.home, "cardHome");
      setupNav("navTransport", t.transport, "cardTransport");
      setupNav("navLifestyle", t.lifestyle, "cardLifestyle");

      // Set Input Labels
      setText("lblHomeType", t.labels.homeType);
      setText("lblHomeCond", t.labels.homeCond);
      setText("lblHeating", t.labels.heating);
      setText("lblOccupants", t.labels.occupants);
      setText("lblSolarDHW", t.labels.solarDHW);
      setText("lblHomeUse", t.labels.homeUse);
      setText("lblWeeklyKm", t.labels.weeklyKm);
      setText("lblCarType", t.labels.carType);
      setText("lblAlone", t.labels.alone);
      setText("lblPublicTransport", t.labels.publicTransport);
      setText("lblPublicPct", t.labels.publicPct);
      setText("lblFlightsDomestic", t.labels.flightsDomestic);
      setText("lblFlightsEurope", t.labels.flightsEurope);
      setText("lblDiet", t.labels.diet);
      setText("lblGoodsProfile", t.labels.goodsProfile);
      setText("lblDigitalLevel", t.labels.digitalLevel);
      setText("lblSocialShare", t.labels.socialShare);

      setText("btnCalc", t.labels.calc);
      setText("btnDash", t.labels.dash);
      setText("lblTotal", (t.labels.total) ? t.labels.total : "Σύνολο");

      updateUI();
    } else {
      console.error("Model not found");
    }
  } catch (e) {
    console.error(e);
  }

  // Bind Events
  document.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", updateUI);
    el.addEventListener("change", updateUI);
  });

  const btnDash = document.getElementById("btnDash");
  if (btnDash) btnDash.addEventListener("click", () => {
    const res = compute();
    localStorage.setItem("USER_TOTAL", res.totalTons);
    localStorage.setItem("CO2_HOME_VALUES", JSON.stringify(res.homeValues));
    localStorage.setItem("CO2_TRANSPORT_VALUES", JSON.stringify(res.transportValues));
    localStorage.setItem("CO2_LIFE_VALUES", JSON.stringify(res.lifestyleValues));
    location.href = "./dashboard.html";
  });
});
