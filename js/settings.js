async function loadConfig(){
  try{
    const r = await fetch(`../config.json?v=${Date.now()}`, {cache:"no-store"});
    if (!r.ok) return null;
    return await r.json();
  }catch(e){ return null; }
}

const T = {
  el: {
    pageTitle: "Ρυθμίσεις",
    sectionTitle: "Παράμετροι μοντέλου (προσωρινές αλλαγές)",
    sectionDesc: "Οι αλλαγές αποθηκεύονται τοπικά (στη συσκευή/φυλλομετρητή) και εφαρμόζονται μέχρι να γίνει επαναφορά.",
    ciLabel: "Ένταση άνθρακα δικτύου (CI) (kg CO₂/kWh)",
    euLabel: "Στόχος ΕΕ 2030 (tCO₂/έτος)",
    socialLabel: "Κοινόχρηστες υπηρεσίες & υποδομές (tCO₂/έτος)",
    metroLabel: "Μετρό / Τραμ — ενέργεια (kWh/επιβατοχιλιόμετρο)",
    metroHint: "Οι εκπομπές μετρό/τραμ υπολογίζονται ως: kWh/επιβατοχιλιόμετρο × CI.",
    useCustom: "Χρήση προσαρμοσμένης τιμής",
    save: "Αποθήκευση",
    reset: "Επαναφορά",
    back: "Πίσω",
    saved: "Αποθηκεύτηκαν. Επιστρέψτε στον Υπολογιστή ή στο Dashboard για να δείτε τις αλλαγές.",
    resetDone: "Έγινε επαναφορά. Οι προεπιλογές θα ληφθούν από το config.json.",
    errCI: "CI: μη έγκυρη τιμή",
    errEU: "Στόχος ΕΕ: μη έγκυρη τιμή",
    errSocial: "Κοινόχρηστες υπηρεσίες: μη έγκυρη τιμή",
    errMetro: "Μετρό/Τραμ: μη έγκυρη τιμή",
    hintDefault: (v)=>`Προεπιλογή από config.json: ${v}`
  },
  en: {
    pageTitle: "Settings",
    sectionTitle: "Model parameters (temporary overrides)",
    sectionDesc: "Changes are saved locally (on this device/browser) and apply until you reset them.",
    ciLabel: "Grid carbon intensity (CI) (kg CO₂/kWh)",
    euLabel: "EU 2030 target (tCO₂/year)",
    socialLabel: "Public services & infrastructure (tCO₂/year)",
    metroLabel: "Metro / Tram — energy (kWh per passenger‑km)",
    metroHint: "Metro/tram emissions are computed as: kWh per passenger‑km × CI.",
    useCustom: "Use custom value",
    save: "Save",
    reset: "Reset",
    back: "Back",
    saved: "Saved. Go back to the Calculator or Dashboard to see the changes.",
    resetDone: "Reset complete. Defaults will be read from config.json.",
    errCI: "CI: invalid value",
    errEU: "EU target: invalid value",
    errSocial: "Public services: invalid value",
    errMetro: "Metro/Tram: invalid value",
    hintDefault: (v)=>`Default from config.json: ${v}`
  }
};

function applySettingsTexts(){
  const lang = (typeof getLang === "function" ? getLang() : "el") || "el";
  const tt = T[lang] || T.el;
  const set = (id, val)=>{ const el = document.getElementById(id); if (el) el.textContent = val; };
  set("settingsTitle", tt.pageTitle);
  set("settingsSectionTitle", tt.sectionTitle);
  set("settingsSectionDesc", tt.sectionDesc);
  set("ciLabel", tt.ciLabel);
  set("euTargetLabel", tt.euLabel);
  set("socialLabel", tt.socialLabel);
  set("metroLabel", tt.metroLabel);
  set("metroHint", tt.metroHint);
  set("useCustom_ci", tt.useCustom);
  set("useCustom_eu", tt.useCustom);
  set("useCustom_social", tt.useCustom);
  set("useCustom_metro", tt.useCustom);
  set("saveBtn", tt.save);
  set("resetBtn", tt.reset);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.textContent = `← ${tt.back}`;
  return tt;
}

function bindNumber(id, val){
  const el = document.getElementById(id);
  if (el) el.value = (val ?? "").toString();
}
function bindCheck(id, on){
  const el = document.getElementById(id);
  if (el) el.checked = !!on;
}

function getNum(id){
  const el = document.getElementById(id);
  return el ? Number(el.value) : NaN;
}
function getCheck(id){
  const el = document.getElementById(id);
  return el ? !!el.checked : false;
}

function setOverride(key, enabled, value){
  localStorage.setItem(key + "_OVERRIDE_ENABLED", enabled ? "1" : "0");
  if (enabled){
    localStorage.setItem(key + "_OVERRIDE_VALUE", String(value));
  }else{
    localStorage.removeItem(key + "_OVERRIDE_VALUE");
  }
}

function readOverride(key){
  const enabled = localStorage.getItem(key + "_OVERRIDE_ENABLED") === "1";
  const v = Number(localStorage.getItem(key + "_OVERRIDE_VALUE"));
  return { enabled, value: Number.isFinite(v) ? v : null };
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();
  buildNav();

  const tt = applySettingsTexts();

  const cfg = await loadConfig();

  // CI
  const ciDef = cfg?.gridCI_kgCO2_per_kWh ?? 0.25;
  const ciOv = readOverride("gridCI_kgCO2_per_kWh");
  bindNumber("ciValue", ciOv.enabled ? ciOv.value : ciDef);
  bindCheck("ciEnable", ciOv.enabled);
  const ciHint = document.getElementById("ciHint");
  if (ciHint) ciHint.textContent = (tt?.hintDefault ? tt.hintDefault(ciDef) : `Default: ${ciDef}`);

  // EU target
  const euDef = cfg?.euTarget_tCO2_per_year ?? 2.5;
  const euOv = readOverride("euTarget_tCO2_per_year");
  bindNumber("euTargetValue", euOv.enabled ? euOv.value : euDef);
  bindCheck("euTargetEnable", euOv.enabled);

  // Social share
  const sDef = cfg?.socialShare_tCO2_per_year ?? 1.2;
  const sOv = readOverride("socialShare_tCO2_per_year");
  bindNumber("socialValue", sOv.enabled ? sOv.value : sDef);
  bindCheck("socialEnable", sOv.enabled);

  // Metro energy
  const mDef = cfg?.metro_tram_kWh_per_pkm ?? 0.05;
  const mOv = readOverride("metro_tram_kWh_per_pkm");
  bindNumber("metroEnergyValue", mOv.enabled ? mOv.value : mDef);
  bindCheck("metroEnergyEnable", mOv.enabled);

  document.getElementById("saveBtn")?.addEventListener("click", ()=>{
    const ciV = getNum("ciValue");
    const ciE = getCheck("ciEnable");
    if (ciE && !Number.isFinite(ciV)) return alert(tt.errCI);
    setOverride("gridCI_kgCO2_per_kWh", ciE, ciV);

    const euV = getNum("euTargetValue");
    const euE = getCheck("euTargetEnable");
    if (euE && !Number.isFinite(euV)) return alert(tt.errEU);
    setOverride("euTarget_tCO2_per_year", euE, euV);

    const sV = getNum("socialValue");
    const sE = getCheck("socialEnable");
    if (sE && !Number.isFinite(sV)) return alert(tt.errSocial);
    setOverride("socialShare_tCO2_per_year", sE, sV);

    const mV = getNum("metroEnergyValue");
    const mE = getCheck("metroEnergyEnable");
    if (mE && !Number.isFinite(mV)) return alert(tt.errMetro);
    setOverride("metro_tram_kWh_per_pkm", mE, mV);

    alert(tt.saved);
  });

  document.getElementById("resetBtn")?.addEventListener("click", ()=>{
    ["gridCI_kgCO2_per_kWh","euTarget_tCO2_per_year","socialShare_tCO2_per_year","metro_tram_kWh_per_pkm"].forEach(k=>{
      setOverride(k,false,"");
    });
    alert(tt.resetDone);
    location.reload();
  });

  document.getElementById("backBtn")?.addEventListener("click", ()=> history.back());
});
