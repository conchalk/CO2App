/* Dashboard powered by ECharts (offline, self-hosted) */

(function(){
  function T(){
    const lang = getLang();
    return {
      el: {
        title: "Ετήσια Εκτίμηση",
        kpiUserLbl: "Εκτιμώμενη ποσότητα CO₂ (χρήστη)",
        kpiTargetLbl: "Στόχος ΕΕ για το 2030",
        eu: "Στόχος ΕΕ",
        user: "Το αποτύπωμά σου",
        home: "Κατοικία",
        transport: "Μεταφορές",
        life: "Τρόπος Ζωής - Διατροφή",
        backToCalc: "Επιστροφή στον Υπολογισμό",
        categoryLabels: {
          home: ["Θέρμανση", "Ζεστό νερό (DHW)", "Ηλεκτρική ενέργεια & ψύξη"],
          transport: ["ΙΧ/Μηχανή", "Δημόσια μέσα", "Πτήσεις εσωτερικού", "Πτήσεις Ευρώπης"],
          life: ["Διατροφή", "Προϊόντα", "Ψηφιακή κατανάλωση", "Υπηρεσίες & υποδομές"]
        },
        unit: "t CO₂/έτος",      },
      en: {
        title: "Annual Estimate",
        kpiUserLbl: "Estimated CO₂ (user)",
        kpiTargetLbl: "EU target for 2030",
        eu: "EU target",
        user: "Your footprint",
        home: "Home",
        transport: "Transport",
        life: "Lifestyle",
        backToCalc: "Back to calculator",
        categoryLabels: {
          home: ["Heating", "Hot water (DHW)", "Electricity & cooling"],
          transport: ["Car/motorbike", "Public transport", "Domestic flights", "Intra-Europe flights"],
          life: ["Diet", "Goods", "Digital", "Public services"]
        },
        unit: "t CO₂/year",      }
    }[lang];
  }

  function safeArr(key, n){
    try{
      const v = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(v)) {
        const out = v.map(x=>Number(x)||0);
        while(out.length < n) out.push(0);
        return out.slice(0,n);
      }
    }catch(e){}
    return Array.from({length:n}, ()=>0);
  }

  function renderPie(domId, title, labels, values){
    const el = document.getElementById(domId);
    if (!el || !window.echarts) return;

    const chart = echarts.init(el);

    const data = labels.map((name, i)=>({name, value: Math.max(0, Number(values[i]||0))}));

    chart.setOption({
      title: { text: title, left: "center", top: 6, textStyle: { fontSize: 16, fontWeight: 600, color: "#314e4e" } },
      tooltip: { trigger: "item", formatter: (p)=> `${p.name}: ${Number(p.value).toFixed(2)} (${Number(p.percent).toFixed(0)}%)` },
      series: [{
        type: "pie",
        radius: ["58%","72%"],
        center: ["50%","56%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, formatter: (p)=> `${p.name}\n${Number(p.value).toFixed(2)}` },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
        data
      }]
    });

    window.addEventListener("resize", ()=>chart.resize());
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    initLangButtons();
    applyUnitYearElements();
    const t = T();

    const setText = (id, txt)=>{ const el = document.getElementById(id); if (el) el.textContent = txt; };

    setText("dashTitle", t.title);

    // Totals are produced by footprint.js
    const userTotal = Number(localStorage.getItem("USER_TOTAL") || "0") || 0;
    const euTarget = Number(localStorage.getItem("EU_TARGET") || "0") || 0;

    // KPI labels & values
    setText("kpiUserLbl", t.kpiUserLbl);
    setText("kpiTargetLbl", t.kpiTargetLbl);
    setText("kpiUserVal", fmt(userTotal, 2));
    setText("kpiTargetVal", fmt(euTarget, 2));

    // Section titles
    setText("homeTitle", t.home);
    setText("transportTitle", t.transport);
    setText("lifeTitle", t.life);
    const homeVals = safeArr("CO2_HOME_VALUES", 3);
    const trVals = safeArr("CO2_TRANSPORT_VALUES", 4);
    const lifeVals = safeArr("CO2_LIFE_VALUES", 4);

    renderPie("pieHome", t.home, t.categoryLabels.home, homeVals);
    renderPie("pieTransport", t.transport, t.categoryLabels.transport, trVals);
    renderPie("pieLife", t.life, t.categoryLabels.life, lifeVals);

    const toCalc = document.getElementById("toFootprintBtn");
    if (toCalc){
      toCalc.textContent = t.backToCalc;
      toCalc.addEventListener("click", ()=>go("./footprint.html"));
    }
    const backBtn = document.getElementById("backBtn");
    if (backBtn){
      backBtn.addEventListener("click", ()=>history.back());
    }
  });
})();
