function isPagesDir(){
  return location.pathname.includes("/pages/");
}


function isStandaloneMode(){
  try{
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator && window.navigator.standalone === true);
  }catch(e){
    return false;
  }
}

function openDrawer(){
  const d = document.getElementById("drawer");
  const b = document.getElementById("drawerBackdrop");
  if (!d || !b) return;
  d.classList.add("open");
  b.style.display = "block";
  d.setAttribute("aria-hidden", "false");
  b.setAttribute("aria-hidden", "false");
}

function closeDrawer(){
  const d = document.getElementById("drawer");
  const b = document.getElementById("drawerBackdrop");
  if (!d || !b) return;
  d.classList.remove("open");
  b.style.display = "none";
  d.setAttribute("aria-hidden", "true");
  b.setAttribute("aria-hidden", "true");
}

function pageName(){
  const p = location.pathname.split("/").pop();
  return p && p.length ? p : "index.html";
}

function buildNav(){
  const nav = document.getElementById("drawerNav");
  if (!nav) return;

  const lang = getLang();
  const t = {
    el: {home:"Αρχική", quiz:"Quiz", foot:"Υπολογιστής CO₂", info:"Τεκμηρίωση", about:"Πληροφορίες", install:"Εγκατάσταση σε κινητό", settings:"Ρυθμίσεις" },
    en: {home:"Home", quiz:"Quiz", foot:"Footprint", info:"Documentation", about:"Info", install:"Install on phone", settings:"Settings" }
  }[lang];

  const here = pageName();
  const inPages = isPagesDir();

  const base = inPages ? "../" : "./";
  const items = inPages ? [
    {label:t.home, href: base+"index.html", icon:"home"},
    {label:t.quiz, href: "./quiz.html", icon:"quiz"},
    {label:t.foot, href: "./footprint.html", icon:"co2"},
    {label:t.info, href: "./info.html", icon:"info"},
    {label:t.about, href: "./about.html", icon:"about"},
    {label:t.settings, href: "./settings.html", icon:"settings"},
    {label:t.install, href: "./install.html", icon:"install"},  ] : [
    {label:t.home, href: "./index.html", icon:"home"},
    {label:t.quiz, href: "./pages/quiz.html", icon:"quiz"},
    {label:t.foot, href: "./pages/footprint.html", icon:"co2"},
    {label:t.info, href: "./pages/info.html", icon:"info"},
    {label:t.about, href: "./pages/about.html", icon:"about"},
    {label:t.settings, href: "./pages/settings.html", icon:"settings"},
    {label:t.install, href: "./pages/install.html", icon:"install"},  ];

  nav.innerHTML = "";
  const standalone = isStandaloneMode();
  const visibleItems = standalone ? items.filter(x => x.icon !== 'install') : items;

  visibleItems.forEach(it=>{
    const div = document.createElement("div");
    div.className = "drawerItem";

    const target = it.href.split("/").pop();
    div.classList.toggle("active", here === target);

    const ic = document.createElement("span");
    ic.className = "drawerIcon";

    const iconBase = inPages ? "../assets/ui/" : "./assets/ui/";
    if (it.icon === "home"){
      const img = document.createElement("img");
      img.src = iconBase + "homeN.png";
      img.alt = "";
      img.width = 26;
      img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      ic.appendChild(img);
    } else if (it.icon === "co2"){
      const img = document.createElement("img");
      img.src = iconBase + "co2N.png";
      img.alt = "";
      img.width = 26;
      img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      ic.appendChild(img);
    } else if (it.icon === "quiz"){
      const img = document.createElement("img");
      img.src = iconBase + "quizN.png";
      img.alt = "";
      img.width = 26;
      img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      ic.appendChild(img);
    } else if (it.icon === "about"){
      const img = document.createElement("img");
      img.src = iconBase + "infoN.png";
      img.alt = "";
      img.width = 26;
      img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      ic.appendChild(img);
    } else if (it.icon === "install"){
      const img = document.createElement("img");
      img.src = iconBase + "installN.png";
      img.alt = "";
      img.width = 26;
      img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      ic.appendChild(img);
    } else if (it.icon === "info"){
      const img = document.createElement("img");
      img.src = iconBase + "bookN.png";
      img.alt = "";
      img.width = 26;
      img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      ic.appendChild(img);
    } else if (it.icon === "settings"){
      const img = document.createElement("img");
      img.src = iconBase + "settingsN.png";
      img.alt = "";
      img.width = 26;
      img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      ic.appendChild(img);
    } else {
      ic.textContent = "•";
    }

    const tx = document.createElement("span");
    tx.className = "drawerText";
    tx.textContent = it.label;

    // Show last quiz score next to Quiz
    if (it.icon === "quiz"){
      try{
        const qs = localStorage.getItem("quizScore");
        const n = Number(qs);
        if (qs !== null && !Number.isNaN(n)){
          const badge = document.createElement("span");
          badge.className = "quizBadge";
          badge.textContent = `${n}/100`;
          tx.appendChild(badge);
        }
      }catch(e){}
    }

    div.appendChild(ic);
    div.appendChild(tx);

    div.addEventListener("click", ()=>{
      closeDrawer();
      location.href = it.href;
    });

    nav.appendChild(div);
  });
}

function buildLangToggle(){
  const wrap = document.getElementById("drawerLang");
  if (!wrap) return;

  const lang = getLang();
  const target = (lang === "el") ? "en" : "el";
  const label = (lang === "el") ? "English" : "Ελληνικά";
  const icon = (lang === "el") ? "lang_en.png" : "lang_el.png";

  wrap.innerHTML = "";

  const div = document.createElement("div");
  div.className = "drawerItem";
  div.setAttribute("data-lang-toggle", "1");

  const ic = document.createElement("span");
  ic.className = "drawerIcon";
  const img = document.createElement("img");
  img.src = (isPagesDir() ? "../assets/ui/" : "./assets/ui/") + icon;
  img.alt = "";
  img.width = 28;
  img.height = 28;
  img.style.width = "28px";
  img.style.height = "28px";
  img.style.display = "block";
  img.style.objectFit = "contain";
  ic.appendChild(img);

  const tx = document.createElement("span");
  tx.className = "drawerText";
  tx.textContent = label;

  div.appendChild(ic);
  div.appendChild(tx);

  div.addEventListener("click", ()=>{
    setLang(target);
    location.reload();
  });

  wrap.appendChild(div);
}

document.addEventListener("DOMContentLoaded", ()=>{
  try{ if (typeof initHomeButton === "function") initHomeButton(); }catch(e){}

  buildNav();
  buildLangToggle();

  // Some pages used legacy ids (openDrawer/closeDrawer). Support both.
  const menuBtn = document.getElementById("menuBtn") || document.getElementById("openDrawer");
  const closeBtn = document.getElementById("drawerClose") || document.getElementById("closeDrawer");
  const backdrop = document.getElementById("drawerBackdrop");

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
});