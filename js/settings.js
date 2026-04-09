async function loadConfig(){
  try{
    const r = await fetch(`../config.json?v=${Date.now()}`, {cache:"no-store"});
    if (!r.ok) return null;
    return await r.json();
  }catch(e){ return null; }
}

// Λεξικό μεταφράσεων
const texts = {
  el: {
    title: "Ρυθμίσεις",
    subtitle: "Παράμετροι σεναρίου (παρακάμψεις)",
    grid: "Ένταση Δικτύου (kgCO2/kWh)",
    social: "Κοινωνικό Μερίδιο (tCO2/έτος)",
    metro: "Ενέργεια Μετρό/Τραμ (kWh/pkm)",
    enable: "Ενεργό",
    save: "Αποθήκευση",
    reset: "Επαναφορά",
    savedMsg: "Οι ρυθμίσεις αποθηκεύτηκαν"
  },
  en: {
    title: "Settings",
    subtitle: "Scenario parameters (Overrides)",
    grid: "Grid CI (kgCO2/kWh)",
    social: "Social Share Goal (tCO2/year)",
    metro: "Metro/Tram Energy (kWh/pkm)",
    enable: "Enable",
    save: "Save",
    reset: "Reset",
    savedMsg: "Settings saved"
  }
};

function updatePageLanguage() {
  const lang = (typeof getLang === 'function') ? getLang() : 'el';
  const t = texts[lang === 'el' ? 'el' : 'en'];

  // Ενημέρωση κειμένων
  const setText = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
  
  setText("pageTitle", t.title);
  setText("pageSubtitle", t.subtitle);
  
  setText("lblGrid", t.grid);
  setText("lblSocial", t.social);
  setText("lblMetro", t.metro);
  
  setText("lblEn1", t.enable);
  setText("lblEn2", t.enable);
  setText("lblEn3", t.enable);
  
  setText("saveBtn", t.save);
  setText("resetBtn", t.reset);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  if(typeof initLangButtons === 'function') initLangButtons();
  
  // Αρχική ρύθμιση γλώσσας
  updatePageLanguage();

  // Helpers
  const setVal = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  const getVal = (id) => { const el = document.getElementById(id); return el ? Number(el.value) : NaN; };
  const setChk = (id, v) => { const el = document.getElementById(id); if(el) el.checked = v; };
  const getChk = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };

  // Load defaults
  const cfg = await loadConfig() || {};
  const defaults = {
    ci: cfg.gridCI_kgCO2_per_kWh || 0.25,
    social: cfg.socialShare_tCO2_per_year || 1.2,
    metro: cfg.metro_tram_kWh_per_pkm || 0.05
  };

  // Load current overrides
  const loadOv = (key, elVal, elChk, def) => {
    const enabled = localStorage.getItem(key+"_OVERRIDE_ENABLED") === "1";
    const val = Number(localStorage.getItem(key+"_OVERRIDE_VALUE"));
    setChk(elChk, enabled);
    setVal(elVal, enabled && Number.isFinite(val) ? val : def);
  };

  loadOv("gridCI_kgCO2_per_kWh", "ciValue", "ciEnable", defaults.ci);
  loadOv("socialShare_tCO2_per_year", "socialValue", "socialEnable", defaults.social);
  loadOv("metro_tram_kWh_per_pkm", "metroEnergyValue", "metroEnergyEnable", defaults.metro);

  // Save Event
  document.getElementById("saveBtn").addEventListener("click", ()=>{
    const saveOv = (key, elVal, elChk) => {
      const en = getChk(elChk);
      const v = getVal(elVal);
      localStorage.setItem(key+"_OVERRIDE_ENABLED", en ? "1" : "0");
      if(en) localStorage.setItem(key+"_OVERRIDE_VALUE", v);
    };
    
    saveOv("gridCI_kgCO2_per_kWh", "ciValue", "ciEnable");
    saveOv("socialShare_tCO2_per_year", "socialValue", "socialEnable");
    saveOv("metro_tram_kWh_per_pkm", "metroEnergyValue", "metroEnergyEnable");
    
    const lang = (typeof getLang === 'function') ? getLang() : 'el';
    const msg = texts[lang === 'el' ? 'el' : 'en'].savedMsg;
    alert(msg);
  });

  // Reset Event
  document.getElementById("resetBtn").addEventListener("click", ()=>{
    ["gridCI_kgCO2_per_kWh", "socialShare_tCO2_per_year", "metro_tram_kWh_per_pkm"].forEach(k => {
        localStorage.removeItem(k+"_OVERRIDE_ENABLED");
        localStorage.removeItem(k+"_OVERRIDE_VALUE");
    });
    location.reload();
  });
  
  // Παρακολούθηση αλλαγής γλώσσας (αν το common.js στέλνει event)
  window.addEventListener("storage", (e)=>{
    if (e.key === "lang") updatePageLanguage();
  });
});
