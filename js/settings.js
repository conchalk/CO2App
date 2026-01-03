async function loadConfig(){
  try{
    const r = await fetch(`../config.json?v=${Date.now()}`, {cache:"no-store"});
    if (!r.ok) return null;
    return await r.json();
  }catch(e){ return null; }
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

  const cfg = await loadConfig();

  // CI
  const ciDef = cfg?.gridCI_kgCO2_per_kWh ?? 0.25;
  const ciOv = readOverride("gridCI_kgCO2_per_kWh");
  bindNumber("ciValue", ciOv.enabled ? ciOv.value : ciDef);
  bindCheck("ciEnable", ciOv.enabled);
  const ciHint = document.getElementById("ciHint");
  if (ciHint) ciHint.textContent = `Προεπιλογή από config.json: ${ciDef}`;

  // EU target
  const euDef = cfg?.euTarget_tCO2_per_year ?? 2.3;
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
    if (ciE && !Number.isFinite(ciV)) return alert("CI: μη έγκυρη τιμή");
    setOverride("gridCI_kgCO2_per_kWh", ciE, ciV);

    const euV = getNum("euTargetValue");
    const euE = getCheck("euTargetEnable");
    if (euE && !Number.isFinite(euV)) return alert("Στόχος ΕΕ: μη έγκυρη τιμή");
    setOverride("euTarget_tCO2_per_year", euE, euV);

    const sV = getNum("socialValue");
    const sE = getCheck("socialEnable");
    if (sE && !Number.isFinite(sV)) return alert("Κοινόχρηστες υπηρεσίες: μη έγκυρη τιμή");
    setOverride("socialShare_tCO2_per_year", sE, sV);

    const mV = getNum("metroEnergyValue");
    const mE = getCheck("metroEnergyEnable");
    if (mE && !Number.isFinite(mV)) return alert("Μετρό/Τραμ: μη έγκυρη τιμή");
    setOverride("metro_tram_kWh_per_pkm", mE, mV);

    alert("Αποθηκεύτηκαν. Επιστρέψτε στον Υπολογιστή ή στο Dashboard για να δείτε τις αλλαγές.");
  });

  document.getElementById("resetBtn")?.addEventListener("click", ()=>{
    ["gridCI_kgCO2_per_kWh","euTarget_tCO2_per_year","socialShare_tCO2_per_year","metro_tram_kWh_per_pkm"].forEach(k=>{
      setOverride(k,false,"");
    });
    alert("Έγινε επαναφορά. Οι προεπιλογές θα ληφθούν από το config.json.");
    location.reload();
  });

  document.getElementById("backBtn")?.addEventListener("click", ()=> history.back());
});
