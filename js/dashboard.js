/* Dashboard powered by ECharts (offline, self-hosted) */

(function(){
  function T(){
    const lang = getLang();
    return {
      el: {
        title: "Dashboard Αποτυπώματος CO₂",
        eu: "Στόχος ΕΕ",
        user: "Το αποτύπωμά σου",
        home: "Κατοικία",
        transport: "Μεταφορές",
        life: "Lifestyle",
        backToCalc: "Επιστροφή στον Υπολογισμό",
        categoryLabels: {
          home: ["Θέρμανση", "Ζεστό νερό (DHW)", "Ηλεκτρική ενέργεια & ψύξη"],
          transport: ["ΙΧ/Μηχανή", "Δημόσια μέσα", "Πτήσεις εσωτερικού", "Πτήσεις Ευρώπης"],
          life: ["Διατροφή", "Προϊόντα", "Ψηφιακή κατανάλωση", "Υπηρεσίες & υποδομές"]
        },
        unit: "t CO₂/έτος",
        percentLabel: "% του στόχου",
        reductionLabel: "Απαιτούμενη μείωση"
      },
      en: {
        title: "CO₂ Footprint Dashboard",
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
        unit: "t CO₂/year",
        percentLabel: "% of target",
        reductionLabel: "Reduction needed"
      }
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
      title: { text: title, left: "center", top: 8 },
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      series: [{
        type: "pie",
        radius: ["35%","70%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, formatter: "{b}\n{c}" },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
        data
      }]
    });

    window.addEventListener("resize", ()=>chart.resize());
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    initLangButtons();
    const t = T();

    const setText = (id, txt)=>{ const el = document.getElementById(id); if (el) el.textContent = txt; };

    setText("dashTitle", t.title);
    setText("euLabel", t.eu);
    setText("userLabel", t.user);

    setText("homeTitle", t.home);
    setText("transportTitle", t.transport);
    setText("lifeTitle", t.life);

    const euTarget = Number(localStorage.getItem("EU_TARGET")) || 2.3;
    const userTotal = Number(localStorage.getItem("USER_TOTAL")) || 0;

    setText("euVal", `${fmt(euTarget,2)} ${t.unit}`);
    setText("userVal", `${fmt(userTotal,2)} ${t.unit}`);
    const pct = euTarget > 0 ? (userTotal / euTarget) * 100 : 0;
    const reduction = Math.max(0, userTotal - euTarget);
    setText("percentLabel", t.percentLabel);
    setText("reductionLabel", t.reductionLabel);
    setText("percentVal", `${fmt(pct,1)}%`);
    setText("reductionVal", `${fmt(reduction,2)} ${t.unit}`);

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
