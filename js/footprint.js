let model = null;
let appConfig = null; // loaded from /config.json


function val(x){
  if (x === null || x === undefined) return 0;
  if (typeof x === "number") return x;
  if (typeof x === "object" && "value" in x) return Number(x.value) || 0;
  return Number(x) || 0;
}

function getOverrideNumber(key){
  try{
    const enabled = localStorage.getItem(key + "_OVERRIDE_ENABLED") === "1";
    if (!enabled) return null;
    const v = Number(localStorage.getItem(key + "_OVERRIDE_VALUE"));
    return Number.isFinite(v) ? v : null;
  }catch(e){ return null; }
}
function getEffectiveNumber(key, fallback){
  const ov = getOverrideNumber(key);
  if (ov !== null) return ov;
  if (appConfig && typeof appConfig[key] !== "undefined"){
    const v = Number(appConfig[key]);
    if (Number.isFinite(v)) return v;
  }
  return fallback;
}


function T(){
  const lang = getLang();
  return {
    el: {
      title: "Εκτίμηση Αποτυπώματος CO₂",
      subtitle: "Τα αποτελέσματα είναι προσεγγιστικά, αναλυτικά στοιχεία για το χρησιμοποιούμενο μοντέλο δες στην Τεκμηρίωση.",
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
        weeklyKm: "Απόσταση μετακίνησης (km/εβδομάδα)",
        carType: "Κύρια επιλογή μετακίνησης",
        publicTransport: "Δημόσια μέσα",
        publicPct: "Από τα οποία γίνονται με δημόσια μέσα",
        alone: "Μετακινούμαι μόνος",
        flightsDomestic: "Πτήσεις εντός Ελλάδας (ανά έτος)",
        flightsEurope: "Πτήσεις εντός Ευρώπης (ανά έτος)",
        diet: "Διατροφή",
        goodsProfile: "Κατανάλωση προϊόντων (Ρούχα, ηλεκτρονικά, αγορές & lifestyle)",
        digitalLevel: "Ψηφιακή κατανάλωση (internet/cloud)",
        socialShare: "Κοινόχρηστες υπηρεσίες & υποδομές (σταθερό)",
        total: "Σύνολο",
        calc: "Υπολόγισε",
        dash: "Διαγράμματα",
        digitalMin: "Χρήση κυρίως email και ελαφριά χρήση internet",
        digitalMid: "Αποθήκευση στο Cloud, λογική χρήση social media",
        digitalMax: "Συχνή χρήση Streaming (Netflix/YouTube), συχνή χρήση AI"
      },
      units: {
        socialShare: "kg CO₂/έτος"
      }
    },
    en: {
      title: "Carbon Footprint Calculator",
      subtitle: "Results are approximate. For details about the model, see Documentation.",
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
        weeklyKm: "Car travel (km/week)",
        carType: "Main travel mode",
        publicTransport: "Public transport",
        publicPct: "Share of trips by public transport",
        alone: "I travel alone",
        flightsDomestic: "Domestic flights (Greece) per year",
        flightsEurope: "Intra-Europe flights per year",
        diet: "Diet",
        goodsProfile: "Goods consumption (Clothes, electronics, shopping & lifestyle)",
        digitalLevel: "Digital consumption (internet/cloud)",
        socialShare: "Public services & infrastructure (fixed)",
        total: "Total",
        calc: "Calculate",
        dash: "Dashboard",
        digitalMin: "Mostly email and light web use",
        digitalMid: "Cloud storage and moderate social media use",
        digitalMax: "Frequent streaming (Netflix/YouTube) and frequent AI use"
      },
      units: {
        socialShare: "kg CO₂/year"
      }
    }
  }[lang];
}

function getUILabel(dim){
  const lang = getLang();
  return (model && model.ui && model.ui[dim] && model.ui[dim].labels) ? model.ui[dim].labels[lang] : null;
}

function getUIOrder(dim){
  return (model && model.ui && model.ui[dim] && Array.isArray(model.ui[dim].order)) ? model.ui[dim].order : [];
}

function populateSelect(sel, dim){
  if (!sel) return;
  sel.innerHTML = "";
  const order = getUIOrder(dim);
  const labels = getUILabel(dim) || {};
  order.forEach(id=>{
    const opt = document.createElement("option");
    opt.value = String(id);
    opt.textContent = (labels && typeof labels === "object") ? (labels[id] ?? String(id)) : String(id);
    sel.appendChild(opt);
  });
}

function getNumber(id){
  const el = document.getElementById(id);
  if (!el) return 0;
  const n = Number(el.value);
  return Number.isFinite(n) ? n : 0;
}

function getSelectValue(id){
  const el = document.getElementById(id);
  return el ? String(el.value) : "";
}

function occupantsToNumber(v){
  if (v === "5plus") return 5;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function piecewiseSliderToAnchor(slider0to100, anchors){
  // anchors: {min, typical, max} or {low, medium, high}
  const x = Math.max(0, Math.min(100, Number(slider0to100)));
  const a0 = anchors.min ?? anchors.low ?? 0;
  const a1 = anchors.typical ?? anchors.medium ?? 0;
  const a2 = anchors.max ?? anchors.high ?? 0;

  if (x <= 50){
    const t = x / 50;
    return a0 + (a1 - a0) * t;
  } else {
    const t = (x - 50) / 50;
    return a1 + (a2 - a1) * t;
  }
}


function homeCondKey(){
  const el = document.getElementById("homeCond");
  const idx = el ? Number(el.value) : 1;
  const order = getUIOrder("homeCondition");
  const safeIdx = Number.isFinite(idx) ? Math.max(0, Math.min(order.length-1, Math.round(idx))) : 1;
  return String(order[safeIdx] ?? order[0] ?? "modern");
}

function goodsFactorFromLevel(level0to100){
  const anchors = (model?.factors?.goodsLevel4?.anchors) ? model.factors.goodsLevel4.anchors : [0,33,67,100];
  const values  = (model?.factors?.goodsLevel4?.values)  ? model.factors.goodsLevel4.values  : [0.4,1.0,1.6,2.2];
  return piecewise4(level0to100, anchors, values);
}

function piecewise4(level0to100, anchors, values){
  const x = Math.max(0, Math.min(100, Number(level0to100)));
  const a = anchors.map(Number);
  const v = values.map(Number);
  // Expect 4 anchors and 4 values
  const A0=a[0]??0, A1=a[1]??33, A2=a[2]??67, A3=a[3]??100;
  const V0=v[0]??0, V1=v[1]??0, V2=v[2]??0, V3=v[3]??0;
  if (x <= A1){
    const t = (A1===A0) ? 0 : (x-A0)/(A1-A0);
    return V0 + (V1-V0)*t;
  } else if (x <= A2){
    const t = (A2===A1) ? 0 : (x-A1)/(A2-A1);
    return V1 + (V2-V1)*t;
  } else {
    const t = (A3===A2) ? 0 : (x-A2)/(A3-A2);
    return V2 + (V3-V2)*t;
  }
}

function compute(){
  if (!model) {
    return {
      totalTons: 0,
      homeValues: [0,0,0],        // heating, dhw, other electricity
      transportValues: [0,0,0,0], // car, public, flights GR, flights EU
      lifestyleValues: [0,0,0,0], // diet, goods, digital, social share
      homeTons: 0, transportTons: 0, lifestyleTons: 0
    };
  }

  const b = model.base || {};
  const f = model.factors || {};
  const c = model.constants || {};
  const p = model.parameters || {};

  const gridCI = getEffectiveNumber("gridCI_kgCO2_per_kWh", val(p.gridCI_kgCO2_per_kWh)); // kg/kWh

  // --- HOME ---
  const homeType = getSelectValue("homeType");          // apartment/detached
  const homeCond = homeCondKey();                      // from slider index -> key
  const heatingType = getSelectValue("heatingType");    // heat_pump, ...
  const occ = occupantsToNumber(getSelectValue("occupants"));
  const solar = !!document.getElementById("solarDHW")?.checked;
  const homeUseLevel = getNumber("homeUseLevel"); // min/typical/max

  const aptDemandMap = (b.heatingDemandKWhApartment && b.heatingDemandKWhApartment.value) ? b.heatingDemandKWhApartment.value : {};
  const aptKWh = Number(aptDemandMap[homeCond] ?? 0);

  const homeTypeMult = val(f.homeType?.[homeType] ?? 1);
  const heatKWh = aptKWh * homeTypeMult;

  const heatIntensity_t_per_MWh = val(f.heatingType?.[heatingType] ?? 0); // t/MWh
  const heatingTons = (heatKWh / 1000) * heatIntensity_t_per_MWh;

  const dhwPerPerson = solar ? val(b.dhwBackupKWhPerPersonPerYear) : val(b.dhwKWhPerPersonPerYear);
  const dhwKWh = occ * dhwPerPerson;
  const dhwTons = (dhwKWh * gridCI) / 1000;

  const anchors = (b.homeOtherElectricityAnchorsKWhPerYear && b.homeOtherElectricityAnchorsKWhPerYear.value) ? b.homeOtherElectricityAnchorsKWhPerYear.value : {min:0,typical:0,max:0};
  const otherKWh = piecewiseSliderToAnchor(homeUseLevel, anchors);
  const otherElecTons = (otherKWh * gridCI) / 1000;

  const homeValues = [heatingTons, dhwTons, otherElecTons];
  const homeTons = heatingTons + dhwTons + otherElecTons;

  // --- TRANSPORT ---
  const weeklyKm = getNumber("weeklyKm");
  const carType = getSelectValue("carType");

  // Split weekly distance into car vs public transport
  const kmPublicRaw = getNumber("publicPct");
  const kmPublic = Math.max(0, Math.min(weeklyKm, kmPublicRaw));
  const kmCar = Math.max(0, weeklyKm - kmPublic);

  // Car kg/km (EV derived from gridCI)
  const alone = !!document.getElementById("alone")?.checked;

  let carKgPerKm = val(f.carType?.[carType] ?? 0);
  if (carType === "electric"){
    const ev_kWh_km = val(p.evConsumption_kWh_per_km);
    carKgPerKm = gridCI * ev_kWh_km;
  }
  let carTons = kmCar * val(c.weeklyToTonsFactor) * carKgPerKm;
  if (!alone) carTons = carTons / 2;

  // Public transport kg/passenger-km
  const publicType = getSelectValue("publicType"); // bus/metro
  let publicKgPerKm = val(f.publicTransport?.[publicType] ?? 0);
if (publicType === "metro"){
  const metroEnergy = getEffectiveNumber("metro_tram_kWh_per_pkm", val(p.metro_tram_kWh_per_pkm ?? 0.05));
  publicKgPerKm = gridCI * metroEnergy; // kgCO2 per passenger-km
}
const publicTons = kmPublic * val(c.weeklyToTonsFactor) * publicKgPerKm;

  // Flights split (Domestic GR vs Europe)
  const tripsDom = getNumber("flightTripsDomestic");
  const tripsEU = getNumber("flightTripsEurope");

  const kgPerKm = val(c.flightKgPerKmPerPassenger);
  const distDom = val(c.flightTripDistanceKmDomestic);
  const distEU = val(c.flightTripDistanceKmEurope);

  const flightsDomTons = (tripsDom * distDom * kgPerKm) / 1000;
  const flightsEUTons = (tripsEU * distEU * kgPerKm) / 1000;

  const transportValues = [carTons, publicTons, flightsDomTons, flightsEUTons];
  const transportTons = carTons + publicTons + flightsDomTons + flightsEUTons;

  // --- LIFESTYLE ---
  const diet = getSelectValue("diet");
  const dietUnitKg = val(b.dietKgCO2PerYear_unit);
  // factors are stored as { value: number }
  const dietFactor = val(f.diet?.[diet] ?? 0);
  const dietTons = (dietUnitKg * dietFactor) / 1000;

  const goodsLevel = getNumber("goodsLevel");
  const goodsUnitKg = val(b.goodsKgCO2PerYear_unit);
  const goodsFactor = goodsFactorFromLevel(goodsLevel);
  const goodsTons = (goodsUnitKg * goodsFactor) / 1000;

  const digitalLevel = getNumber("digitalLevel");
  const digitalUnitKg = val(b.digitalKgCO2PerYear_unit);
  const digitalAnchors = {
    low: val(f.digitalLevel?.low ?? 0),
    medium: val(f.digitalLevel?.medium ?? 0),
    high: val(f.digitalLevel?.high ?? 0)
  };
  const digitalFactor = piecewiseSliderToAnchor(digitalLevel, digitalAnchors);
  const digitalTons = (digitalUnitKg * digitalFactor) / 1000;

  const socialKg = val(b.socialShareKgCO2PerYear);
  const socialTons = socialKg / 1000;

  const lifestyleValues = [dietTons, goodsTons, digitalTons, socialTons];
  const lifestyleTons = dietTons + goodsTons + digitalTons + socialTons;

  const totalTons = homeTons + transportTons + lifestyleTons;

  return {
    totalTons,
    homeValues,
    transportValues,
    lifestyleValues,
    homeTons,
    transportTons,
    lifestyleTons
  };
}

function saveForDashboard(res){
  localStorage.setItem("CO2_HOME_VALUES", JSON.stringify(res.homeValues));
  localStorage.setItem("CO2_TRANSPORT_VALUES", JSON.stringify(res.transportValues));
  localStorage.setItem("CO2_LIFE_VALUES", JSON.stringify(res.lifestyleValues));
  localStorage.setItem("USER_TOTAL", String(res.totalTons));

  const target = getEffectiveNumber("euTarget_tCO2_per_year", (model && model.targets ? val(model.targets.euTargetTonsPerYear) : 2.5));
  localStorage.setItem("EU_TARGET", String(target));
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();

  // No fallback: must exist
  
// Load config (optional, for easy updates)
try{
  const cfgResp = await fetch(`../config.json?v=${Date.now()}`, { cache: "no-store" });
  if (cfgResp.ok) appConfig = await cfgResp.json();
}catch(e){ appConfig = null; }
const resp = await fetch(`../assets/footprintModel_final_draft.json?v=${Date.now()}`, { cache: "no-store" });
  if (!resp.ok) {
    alert("Λείπει το footprintModel_final_draft.json από τον φάκελο assets.");
    return;
  }
  model = await resp.json();

  const t = T();

  // Titles
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setText("title", t.title);
  setText("subtitle", t.subtitle);
  setText("homeTitle", t.home);
  setText("trTitle", t.transport);
  setText("lifeTitle", t.lifestyle);
  setText("lblTotal", t.labels.total);

  // Chips
  setText("navHome", t.home);
  setText("navTransport", t.transport);
  setText("navLifestyle", t.lifestyle);

  const goTo = (id)=>{ const el = document.getElementById(id); if (el) el.scrollIntoView({behavior:"smooth", block:"start"}); };
  const navHome = document.getElementById("navHome");
  const navTransport = document.getElementById("navTransport");
  const navLifestyle = document.getElementById("navLifestyle");
  if (navHome) navHome.addEventListener("click", ()=>goTo("cardHome"));
  if (navTransport) navTransport.addEventListener("click", ()=>goTo("cardTransport"));
  if (navLifestyle) navLifestyle.addEventListener("click", ()=>goTo("cardLifestyle"));

  // --- Mobile carousel stepper (left/right buttons between cards) ---
  const carousel = document.getElementById("cardsCarousel");
  const stepper = document.getElementById("mobileStepper");
  const stepPrev = document.getElementById("stepPrev");
  const stepNext = document.getElementById("stepNext");
  const stepTitle = document.getElementById("stepTitle");
  const stepKpi = document.getElementById("stepKpi");

  const sections = [
    { id: "cardHome", titleEl: "homeTitle", label: () => t.home, kpi: (res)=>res.homeTons },
    { id: "cardTransport", titleEl: "trTitle", label: () => t.transport, kpi: (res)=>res.transportTons },
    { id: "cardLifestyle", titleEl: "lifeTitle", label: () => t.lifestyle, kpi: (res)=>res.lifestyleTons }
  ];

  let currentIdx = 0;

  function scrollToSection(idx){
    currentIdx = Math.max(0, Math.min(sections.length-1, idx));
    const el = document.getElementById(sections[currentIdx].id);
    if (el){
      // For the horizontal carousel this will scroll sideways; otherwise it scrolls vertically.
      el.scrollIntoView({behavior:"smooth", block:"nearest", inline:"start"});
    }
  }

  // Exposed for updateTotal()
  window.updateStepperUI = (res)=>{
    if (!stepper) return;
    if (stepTitle) stepTitle.textContent = sections[currentIdx].label();
    if (stepKpi) stepKpi.textContent = `${fmt(sections[currentIdx].kpi(res), 2)} t CO₂/yr`;
    if (stepPrev) stepPrev.disabled = (currentIdx === 0);
    if (stepNext) stepNext.disabled = (currentIdx === sections.length-1);
  };

  if (stepPrev) stepPrev.addEventListener("click", ()=>{ scrollToSection(currentIdx-1); updateTotal(); });
  if (stepNext) stepNext.addEventListener("click", ()=>{ scrollToSection(currentIdx+1); updateTotal(); });

  if (carousel){
    carousel.addEventListener("scroll", ()=>{
      // Find the card whose left edge is closest to the carousel's left edge.
      const box = carousel.getBoundingClientRect();
      let best = 0, bestDist = Infinity;
      sections.forEach((s, i)=>{
        const el = document.getElementById(s.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.left - box.left);
        if (dist < bestDist){ bestDist = dist; best = i; }
      });
      if (best !== currentIdx){ currentIdx = best; updateTotal(); }
    }, {passive:true});
  }

  // Labels
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


  setText("digitalMin", t.labels.digitalMin);
  setText("digitalMid", t.labels.digitalMid);
  setText("digitalMax", t.labels.digitalMax);

  // Social share value (fixed)
  const socialKg = (getEffectiveNumber("socialShare_tCO2_per_year", val(model.base?.socialShareKgCO2PerYear)/1000) * 1000);
  setText("socialShareVal", `${Math.round(socialKg)} ${t.units.socialShare}`);

  // Populate selects
  populateSelect(document.getElementById("homeType"), "homeType");  populateSelect(document.getElementById("heatingType"), "heatingType");
  populateSelect(document.getElementById("occupants"), "occupants");  populateSelect(document.getElementById("carType"), "carType");  populateSelect(document.getElementById("publicType"), "publicTransport");
  populateSelect(document.getElementById("diet"), "diet");

  // Defaults (from ui if present)
  const setDefault = (id, dim)=>{
    const el = document.getElementById(id);
    if (!el) return;
    const def = model.ui?.[dim]?.default;
    if (def !== undefined && [...el.options].some(o=>o.value===String(def))) el.value = String(def);
  };
  setDefault("homeType","homeType");
  setDefault("homeCond","homeCondition");
  setDefault("heatingType","heatingType");
  setDefault("occupants","occupants");
  setDefault("carType","carType");
  setDefault("publicType","publicTransport");
  setDefault("diet","diet");
  // Defaults for select + ranges
  const homeCondEl = document.getElementById("homeCond");
  if (homeCondEl) homeCondEl.value = String(model.ui?.homeCondition?.defaultIndex ?? 1);

  const homeUseEl = document.getElementById("homeUseLevel");
  if (homeUseEl) homeUseEl.value = String(model.ui?.homeUseLevel?.default ?? 50);

  const goodsEl = document.getElementById("goodsLevel");
  if (goodsEl) goodsEl.value = String(model.ui?.goodsLevel4?.default ?? 33);

  const digital = document.getElementById("digitalLevel");
  if (digital) digital.value = String(model.ui?.digitalLevel?.default ?? 50);

  const publicPct = document.getElementById("publicPct");
  if (publicPct) publicPct.value = String(model.ui?.publicPct?.default ?? 0);

const updateBadges = ()=>{
    // No percentage badges; we only show descriptive labels below sliders.
// Public transport: show km (pct * weekly km)
    const pv = document.getElementById("publicKmVal");
    const wk = document.getElementById("weeklyKm");
    const wkKm = wk ? (Number(wk.value)||0) : 0;
    const pubKm = publicPct ? (Number(publicPct.value)||0) : 0;
    if (publicPct && wk) publicPct.max = String(wkKm);
    const clamped = Math.max(0, Math.min(wkKm, pubKm));
    if (pv && publicPct) pv.textContent = `${Math.round(clamped)} km`;

    // Home condition (3-stop slider) label
    const hcL = document.getElementById("homeCondLabel");
    const hc = document.getElementById("homeCond");
    if (hcL && hc){
      const order = getUIOrder("homeCondition");
      const labels = getUILabel("homeCondition") || {};
      const idx = Math.max(0, Math.min(order.length-1, Math.round(Number(hc.value)||0)));
      const key = order[idx];
      hcL.textContent = (labels && typeof labels === "object") ? (labels[key] ?? String(key)) : String(key);
    }

    // Home electricity use (continuous slider with 3 anchor descriptions)
    const huL = document.getElementById("homeUseLabel");
    const hu = document.getElementById("homeUseLevel");
    if (huL && hu){
      const x = Number(hu.value)||0;
      const labels = getUILabel("homeUseLevel") || {};
      // show closest anchor label (min/typical/max) while allowing intermediate mapping
      const key = (x < 33) ? "min" : (x > 66) ? "max" : "typical";
      huL.textContent = labels[key] ?? "";
    }

    // Goods slider (4 anchor descriptions)
    const gL = document.getElementById("goodsLabel");
    const g = document.getElementById("goodsLevel");
    if (gL && g){
      const x = Number(g.value)||0;
      const labels = getUILabel("goodsLevel4") || {};
      const key = (x < 17) ? "lvl0" : (x < 50) ? "lvl1" : (x < 84) ? "lvl2" : "lvl3";
      gL.textContent = labels[key] ?? "";
    }

    // Digital label (low/med/high)
    const dl = document.getElementById("digitalLabel");
    if (dl && digital){
      const x = Number(digital.value);
      dl.textContent = (x < 33) ? t.labels.digitalMin : (x > 66) ? t.labels.digitalMax : t.labels.digitalMid;
    }
  };

  ["digitalLevel","publicPct","weeklyKm","homeCond","homeUseLevel","goodsLevel"].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", ()=>{ updateBadges(); updateTotal(); });
    el.addEventListener("change", ()=>{ updateBadges(); updateTotal(); });
  });

  // Checkbox listeners
  const solarBox = document.getElementById("solarDHW");
  if (solarBox){
    solarBox.addEventListener("change", updateTotal);
  }
  const aloneBox = document.getElementById("alone");
  if (aloneBox){
    aloneBox.addEventListener("change", updateTotal);
  }

  updateBadges();

  const btnCalc = document.getElementById("btnCalc");
  const btnDash = document.getElementById("btnDash");
  if (btnCalc) btnCalc.textContent = t.labels.calc;
  if (btnDash) btnDash.textContent = t.labels.dash;

  function updateTotal(){
    const res = compute();
    // sanitize NaN
    ["totalTons","homeTons","transportTons","lifestyleTons"].forEach(k=>{ if(!Number.isFinite(res[k])) res[k]=0; });
    ["homeValues","transportValues","lifestyleValues"].forEach(k=>{ if(Array.isArray(res[k])) res[k]=res[k].map(x=>Number.isFinite(x)?x:0); });
    const tv = document.getElementById("totalVal");
    if (tv) tv.textContent = fmt(res.totalTons, 2);

    // Category KPIs (shown inside each card header)
    const hk = document.getElementById("homeKpi");
    const tk = document.getElementById("trKpi");
    const lk = document.getElementById("lifeKpi");
    if (hk) hk.textContent = fmt(res.homeTons, 2);
    if (tk) tk.textContent = fmt(res.transportTons, 2);
    if (lk) lk.textContent = fmt(res.lifestyleTons, 2);

    // Mobile stepper KPI
    if (typeof updateStepperUI === "function") updateStepperUI(res);

    const target = getEffectiveNumber("euTarget_tCO2_per_year", (model && model.targets ? val(model.targets.euTargetTonsPerYear) : 2.5));
    const rp = document.getElementById("reducePct");
    if (rp){
      const lang = getLang();
      if (res.totalTons > target){
        const pct = Math.max(0, (1 - (target / res.totalTons)) * 100);
        rp.textContent = (lang === "en")
          ? `Needed reduction to reach EU target (${fmt(target,2)} t/yr): ${fmt(pct,0)}%`
          : `Απαιτούμενη μείωση για τον στόχο ΕΕ (${fmt(target,2)} t/έτος): ${fmt(pct,0)}%`;
      } else {
        rp.textContent = (lang === "en")
          ? `You are at or below the EU target (${fmt(target,2)} t/yr).`
          : `Είσαι εντός στόχου ΕΕ (${fmt(target,2)} t/έτος).`;
      }
    }
  }

  // Live updates
  document.querySelectorAll("select,input").forEach(el=>{
    const t = (el.getAttribute("type")||"").toLowerCase();
    if (t==="button" || t==="submit" || t==="hidden") return;

    el.addEventListener("input", updateTotal);
    el.addEventListener("change", updateTotal);
  });

  if (btnCalc) btnCalc.addEventListener("click", updateTotal);
  if (btnDash) btnDash.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation();
    const res = compute();
    saveForDashboard(res);
    go("./dashboard.html");
  });

  updateTotal();
});