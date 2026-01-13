(function(){
  function renderCharts(){
    if(!window.echarts) return;
    
    // 1. Ανάκτηση Δεδομένων από τη μνήμη
    const homeVals = JSON.parse(localStorage.getItem("CO2_HOME_VALUES") || "[0,0,0]");
    const transVals = JSON.parse(localStorage.getItem("CO2_TRANSPORT_VALUES") || "[0,0,0,0]");
    const lifeVals = JSON.parse(localStorage.getItem("CO2_LIFE_VALUES") || "[0,0,0,0]");
    const userTotal = Number(localStorage.getItem("USER_TOTAL")) || 0;
    const euTarget = Number(localStorage.getItem("EU_TARGET")) || 2.5;

    // 2. Ορισμός Κειμένων (Ελληνικά / Αγγλικά)
    const lang = getLang(); // Η συνάρτηση υπάρχει στο common.js

    const T = {
      el: {
        pageTitle: "Ετήσια Εκτίμηση",
        userLabel: "Εκτιμώμενη ποσότητα CO₂ (χρήστη)",
        targetLabel: "Στόχος ΕΕ για το 2030",
        
        homeTitle: "Κατοικία",
        transTitle: "Μεταφορές",
        lifeTitle: "Τρόπος Ζωής - Διατροφή",
        
        back: "Επιστροφή",
        
        chartLabels: {
          home: ["Θέρμανση", "ΖΝΧ", "Ηλεκτρισμός"],
          trans: ["ΙΧ", "Δημόσια", "Πτήσεις Εσ.", "Πτήσεις Εξ."],
          life: ["Διατροφή", "Αγαθά", "Digital", "Κοινόχρηστα"]
        }
      },
      en: {
        pageTitle: "Annual Estimation",
        userLabel: "Estimated CO₂ amount (user)",
        targetLabel: "EU Target 2030",
        
        homeTitle: "Housing",
        transTitle: "Transport",
        lifeTitle: "Lifestyle - Diet",
        
        back: "Back",
        
        chartLabels: {
          home: ["Heating", "DHW", "Electricity"],
          trans: ["Car", "Public", "Dom. Flights", "Intl. Flights"],
          life: ["Diet", "Goods", "Digital", "Public Services"]
        }
      }
    }[lang];

    // 3. Ενημέρωση των Τίτλων στη σελίδα
    const setText = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };

    setText("dashTitle", T.pageTitle);      // Ο Γενικός Τίτλος
    setText("kpiUserLbl", T.userLabel);
    setText("kpiTargetLbl", T.targetLabel);
    
    setText("homeTitle", T.homeTitle);      // Τίτλος Κατοικίας
    setText("transportTitle", T.transTitle); // Τίτλος Μεταφορών
    setText("lifeTitle", T.lifeTitle);      // Τίτλος Τρόπου Ζωής

    // Ενημέρωση Κουμπιού Επιστροφής
    setText("toFootprintBtn", T.back);

    // 4. Ενημέρωση Τιμών (KPIs)
    document.getElementById("kpiUserVal").textContent = fmt(userTotal);
    document.getElementById("kpiTargetVal").textContent = fmt(euTarget);


    // 5. Ρυθμίσεις Διαγραμμάτων (Pie Charts)
    const pieOpt = (data) => ({
      tooltip: { 
        trigger: 'item', 
        formatter: '{b}: {c} ({d}%)' // Εμφανίζει: Όνομα: Τιμή (Ποσοστό%)
      },
      series: [{
        type: 'pie',
        radius: ['50%', '70%'], // Δακτύλιος
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false }, // Απόκρυψη ετικετών για καθαρή εμφάνιση
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        data: data
      }]
    });

    const initChart = (id, names, vals) => {
      const el = document.getElementById(id);
      if(!el) return;
      
      // Καθαρισμός αν υπάρχει ήδη γράφημα (για αποφυγή bugs σε reload)
      if(echarts.getInstanceByDom(el)) echarts.getInstanceByDom(el).dispose();

      const ch = echarts.init(el);
      // Αντιστοίχιση ονομάτων με τιμές
      const data = names.map((n,i) => ({ value: Number((vals[i]||0).toFixed(2)), name: n }));
      
      ch.setOption(pieOpt(data));
      window.addEventListener("resize", ()=>ch.resize());
    };

    // 6. Δημιουργία των 3 γραφημάτων
    initChart("pieHome", T.chartLabels.home, homeVals);
    initChart("pieTransport", T.chartLabels.trans, transVals);
    initChart("pieLife", T.chartLabels.life, lifeVals);
  }

  // Εκκίνηση όταν φορτώσει η σελίδα
  document.addEventListener("DOMContentLoaded", ()=>{
    if(typeof initLangButtons === 'function') initLangButtons();
    if(typeof applyUnitYearElements === 'function') applyUnitYearElements();
    
    renderCharts();
    
    // Λειτουργία κουμπιών
    const backBtn = document.getElementById("backBtn");
    if(backBtn) backBtn.addEventListener("click", ()=>history.back());
    
    const toFoot = document.getElementById("toFootprintBtn");
    if(toFoot) toFoot.addEventListener("click", ()=>location.href="./footprint.html");
  });
})();
