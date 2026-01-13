// CO2App Menu (robust) — works in root and /pages/
(function(){
  const isPagesDir = () => location.pathname.includes("/pages/");
  
  const isStandaloneMode = () => {
    try{
      return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
             (window.navigator && window.navigator.standalone === true);
    }catch(e){ return false; }
  };

  const getLangSafe = () => (typeof window.getLang === "function") ? window.getLang() : (localStorage.getItem("lang") || "el");
  const setLangSafe = (l) => (typeof window.setLang === "function") ? window.setLang(l) : localStorage.setItem("lang", l);

  const openDrawer = () => {
    const d = document.getElementById("drawer");
    const b = document.getElementById("drawerBackdrop");
    if (!d || !b) return;
    d.classList.add("open");
    b.style.display = "block";
    d.setAttribute("aria-hidden","false");
    b.setAttribute("aria-hidden","false");
  };

  const closeDrawer = () => {
    const d = document.getElementById("drawer");
    const b = document.getElementById("drawerBackdrop");
    if (!d || !b) return;
    d.classList.remove("open");
    b.style.display = "none";
    d.setAttribute("aria-hidden","true");
    b.setAttribute("aria-hidden","true");
  };

  const pageName = () => {
    const p = location.pathname.split("/").pop();
    return p && p.length ? p : "index.html";
  };

  const ensureDrawerSkeleton = () => {
    if (document.getElementById("drawer") && document.getElementById("drawerBackdrop")) {
      const closeBtn = document.getElementById("drawerClose");
      if(closeBtn) closeBtn.onclick = closeDrawer;
      return;
    }

    let backdrop = document.getElementById("drawerBackdrop");
    if (!backdrop){
      backdrop = document.createElement("div");
      backdrop.className = "drawerBackdrop";
      backdrop.id = "drawerBackdrop";
      document.body.appendChild(backdrop);
    }
    backdrop.setAttribute("aria-hidden","true");
    backdrop.style.display = "none";

    let drawer = document.getElementById("drawer");
    if (!drawer){
      drawer = document.createElement("nav");
      drawer.className = "drawer";
      drawer.id = "drawer";
      document.body.appendChild(drawer);
    }
    drawer.setAttribute("aria-hidden","true");

    if (!drawer.innerHTML.trim()){
      drawer.innerHTML = `
        <div class="drawerHeader">
          <div class="drawerTitle">CO2App</div>
          <button class="iconBtn" id="drawerClose" aria-label="close">×</button>
        </div>
        <div class="drawerSection" id="drawerNav"></div>
        <div class="drawerSection" id="drawerLang"></div>
      `;
    }
  };

  const buildNav = () => {
    const nav = document.getElementById("drawerNav");
    if (!nav) return;

    const lang = getLangSafe();
    const t = {
      el: {
        home: "Αρχική", 
        quiz: "Quiz", 
        foot: "Υπολογιστής CO₂", 
        docs: "Τεκμηρίωση", 
        info: "Πληροφορίες",
        install: "Εγκατάσταση", 
        settings: "Ρυθμίσεις"
      },
      en: {
        home: "Home",   
        quiz: "Quiz", 
        foot: "Footprint",       
        docs: "Documentation", 
        info: "Info",
        install: "Install App", 
        settings: "Settings"
      }
    }[lang];

    const here = pageName();
    const inPages = isPagesDir();
    const base = inPages ? "../" : "./";
    const pagesBase = inPages ? "./" : "./pages/";

    const items = [
      {label:t.home,     href: base + "index.html",      icon:"home"},
      {label:t.quiz,     href: pagesBase + "quiz.html",      icon:"quiz"},
      {label:t.foot,     href: pagesBase + "footprint.html", icon:"co2"},
      {label:t.docs,     href: pagesBase + "model.html",     icon:"docs"},
      {label:t.info,     href: pagesBase + "info.html",      icon:"about"},
      {label:t.settings, href: pagesBase + "settings.html",  icon:"settings"},
      {label:t.install,  href: pagesBase + "install.html",   icon:"install"},
    ];

    nav.innerHTML = "";
    const standalone = isStandaloneMode();
    const visibleItems = standalone ? items.filter(x => x.icon !== "install") : items;

    const iconBase = inPages ? "../assets/ui/" : "./assets/ui/";
    const iconMap = {
      home: "homeN.png", co2: "co2N.png", quiz: "quizN.png",
      docs: "bookN.png", about: "infoN.png", settings: "settingsN.png", install: "installN.png"
    };

    visibleItems.forEach(it => {
      const div = document.createElement("div");
      div.className = "drawerItem";
      
      const target = it.href.split("/").pop();
      if (here === target) div.classList.add("active");

      const ic = document.createElement("span");
      ic.className = "drawerIcon";
      const img = document.createElement("img");
      img.alt = "";
      img.src = iconBase + (iconMap[it.icon] || "homeN.png");
      ic.appendChild(img);

      const tx = document.createElement("span");
      tx.className = "drawerText";
      tx.textContent = it.label;

      if (it.icon === "quiz"){
        const qs = localStorage.getItem("quizScore");
        if (qs){
          const badge = document.createElement("span");
          badge.className = "quizBadge";
          badge.textContent = `${qs}/100`;
          tx.appendChild(badge);
        }
      }

      div.appendChild(ic);
      div.appendChild(tx);

      div.addEventListener("click", () => {
        closeDrawer();
        location.href = it.href;
      });

      nav.appendChild(div);
    });
  };

  const buildLangToggle = () => {
    const wrap = document.getElementById("drawerLang");
    if (!wrap) return;
    wrap.innerHTML = "";

    const lang = getLangSafe();
    const nextLang = (lang === "el") ? "en" : "el";
    const label = (lang === "el") ? "English" : "Ελληνικά";
    const icon = (lang === "el") ? "lang_en.png" : "lang_el.png";
    const iconBase = isPagesDir() ? "../assets/ui/" : "./assets/ui/";

    const div = document.createElement("div");
    div.className = "drawerItem";
    
    const ic = document.createElement("span");
    ic.className = "drawerIcon";
    const img = document.createElement("img");
    img.src = iconBase + icon;
    img.alt = nextLang;
    ic.appendChild(img);

    const tx = document.createElement("span");
    tx.className = "drawerText";
    tx.textContent = label;

    div.appendChild(ic);
    div.appendChild(tx);

    div.addEventListener("click", () => {
      setLangSafe(nextLang);
      location.reload();
    });

    wrap.appendChild(div);
  };

  const wireDrawer = () => {
    const menuBtn = document.getElementById("menuBtn");
    const closeBtn = document.getElementById("drawerClose");
    const backdrop = document.getElementById("drawerBackdrop");
    
    if (menuBtn) menuBtn.onclick = openDrawer;
    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (backdrop) backdrop.onclick = closeDrawer;
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureDrawerSkeleton();
    buildNav();
    buildLangToggle();
    wireDrawer();
  });
})();
