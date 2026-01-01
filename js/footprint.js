let model = null;

function val(x){
  if (x === null || x === undefined) return 0;
  if (typeof x === "number") return x;
  if (typeof x === "object" && "value" in x) return Number(x.value) || 0;
  return Number(x) || 0;
}

function T(){
  const lang = getLang();
  return {
    el: {
      title: "Υπολογισμός Αποτυπώματος CO₂",
      subtitle: "Τα αποτελέσματα είναι προσεγγιστικά.",
      home: "Κατοικία",
      transport: "Μεταφορές",
      lifestyle: "Lifestyle",
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
        publicPct: "Ποσοστό μετακίνησης με δημόσια μέσα",
        alone: "Μετακινούμαι μόνος",
        flightsDomestic: "Πτήσεις εντός Ελλάδας (ανά έτος)",
        flightsEurope: "Πτήσεις εντός Ευρώπης (ανά έτος)",        diet: "Διατροφή",        goodsProfile: "Κατανάλωση προϊόντων",
        goodsHint: "Ρούχα, ηλεκτρονικά, αγορές & lifestyle.",
        digitalLevel: "Ψηφιακή κατανάλωση (internet/cloud)",
        socialShare: "Κοινόχρηστες υπηρεσίες & υποδομές (σταθερό)",
        total: "Σύνολο",
        calc: "Υπολόγισε",
        dash: "Διαγράμματα",        digitalMin: "Χαμηλή",
        digitalMid: "Μέση",
        digitalMax: "Υψηλή"
      },
      units: {
        socialShare: "kg CO₂/έτος"
      }
    },
    en: {
      title: "Carbon Footprint Calculator",
      subtitle: "Results are approximate.",
      home: "Home",
      transport: "Transport",
      lifestyle: "Lifestyle",
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
        flightsEurope: "Intra-Europe flights per year",        diet: "Diet",        goodsProfile: "Goods consumption",
        goodsHint: "Clothes, electronics, shopping & lifestyle.",
        digitalLevel: "Digital consumption (internet/cloud)",
        socialShare: "Public services & infrastructure (fixed)",
        total: "Total",
        calc: "Calculate",
        dash: "Dashboard",        digitalMin: "Low",
        digitalMid: "Medium",
        digitalMax: "High"
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

  const gridCI = val(p.gridCI_kgCO2_per_kWh); // kg/kWh

  // --- HOME ---
  const homeType = getSelectValue("homeType");          // apartment/detached
  const homeCond = getSelectValue("homeCond");          // modern/partial/none
  const heatingType = getSelectValue("heatingType");    // heat_pump, ...
  const occ = occupantsToNumber(getSelectValue("occupants"));
  const solar = !!document.getElementById("solarDHW")?.checked;
  const homeUseLevel = getSelectValue("homeUseLevel"); // min/typical/max

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
  const otherKWh = (homeUseLevel === "min") ? Number(anchors.min ?? 0)
    : (homeUseLevel === "max") ? Number(anchors.max ?? 0)
    : Number(anchors.typical ?? 0);
  const otherElecTons = (otherKWh * gridCI) / 1000;

  const homeValues = [heatingTons, dhwTons, otherElecTons];
  const homeTons = heatingTons + dhwTons + otherElecTons;

  // --- TRANSPORT ---
  const weeklyKm = getNumber("weeklyKm");
  const carType = getSelectValue("carType");

  // Split weekly distance into car vs public transport
  const publicPct = Math.max(0, Math.min(100, getNumber("publicPct")));
  const kmPublic = weeklyKm * (publicPct / 100);
  const kmCar = weeklyKm - kmPublic;

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
  const publicKgPerKm = val(f.publicTransport?.[publicType] ?? 0);
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
  // factors in JSON are objects with {value: ...}
  const dietFactor = val(f.diet?.[diet] ?? 0);
  const dietTons = (dietUnitKg * dietFactor) / 1000;

  const goodsProfile = getSelectValue("goodsProfile");
  const goodsUnitKg = val(b.goodsKgCO2PerYear_unit);
  const goodsFactor = val(f.goodsProfile?.[goodsProfile] ?? 0);
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

  const target = model && model.targets ? val(model.targets.euTargetTonsPerYear) : 2.3;
  localStorage.setItem("EU_TARGET", String(target));
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();

  // No fallback: must exist
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
  setText("goodsHint", t.labels.goodsHint);
  setText("lblDigitalLevel", t.labels.digitalLevel);
  setText("lblSocialShare", t.labels.socialShare);


  setText("digitalMin", t.labels.digitalMin);
  setText("digitalMid", t.labels.digitalMid);
  setText("digitalMax", t.labels.digitalMax);

  // Social share value (fixed)
  const socialKg = val(model.base?.socialShareKgCO2PerYear);
  setText("socialShareVal", `${Math.round(socialKg)} ${t.units.socialShare}`);

  // Populate selects
  populateSelect(document.getElementById("homeType"), "homeType");
  populateSelect(document.getElementById("homeCond"), "homeCondition");
  populateSelect(document.getElementById("heatingType"), "heatingType");
  populateSelect(document.getElementById("occupants"), "occupants");
  populateSelect(document.getElementById("homeUseLevel"), "homeUseLevel");
  populateSelect(document.getElementById("carType"), "carType");
  populateSelect(document.getElementById("goodsProfile"), "goodsProfile");
  populateSelect(document.getElementById("publicType"), "publicTransport");
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
  setDefault("goodsProfile","goodsProfile");

  // Defaults for select + ranges
  const homeUseSel = document.getElementById("homeUseLevel");
  if (homeUseSel) homeUseSel.value = String(model.ui?.homeUseLevel?.default ?? "typical");

  const digital = document.getElementById("digitalLevel");
  if (digital) digital.value = String(model.ui?.digitalLevel?.default ?? 50);

  const publicPct = document.getElementById("publicPct");
  if (publicPct) publicPct.value = String(model.ui?.publicPct?.default ?? 0);

  const updateBadges = ()=>{
    const dv = document.getElementById("digitalVal");
    const pv = document.getElementById("publicPctVal");
    if (dv && digital) dv.textContent = `${Math.round(Number(digital.value)||0)}%`;
    if (pv && publicPct) pv.textContent = `${Math.round(Number(publicPct.value)||0)}%`;

    const dl = document.getElementById("digitalLabel");
    if (dl && digital){
      const x = Number(digital.value);
      dl.textContent = (x < 33) ? t.labels.digitalMin : (x > 66) ? t.labels.digitalMax : t.labels.digitalMid;
    }
  };

  ["digitalLevel","publicPct"].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", ()=>{ updateBadges(); updateTotal(); });
    el.addEventListener("change", ()=>{ updateBadges(); updateTotal(); });
  });

  if (homeUseSel){
    homeUseSel.addEventListener("change", updateTotal);
    homeUseSel.addEventListener("input", updateTotal);
  }

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
    const tv = document.getElementById("totalVal");
    if (tv) tv.textContent = fmt(res.totalTons, 2);

    const target = model && model.targets ? val(model.targets.euTargetTonsPerYear) : 2.3;
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
  document.querySelectorAll("select,input[type='number']").forEach(el=>{
    el.addEventListener("input", updateTotal);
    el.addEventListener("change", updateTotal);
  });

  if (btnCalc) btnCalc.addEventListener("click", updateTotal);
  if (btnDash) btnDash.addEventListener("click", ()=>{
    const res = compute();
    saveForDashboard(res);
    go("./dashboard.html");
  });

  updateTotal();
});