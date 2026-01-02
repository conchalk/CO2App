const LANG_KEY = "lang"; // 'el' | 'en'

function getLang(){
  const l = localStorage.getItem(LANG_KEY);
  return (l === "en" || l === "el") ? l : "el";
}

function setLang(lang){
  localStorage.setItem(LANG_KEY, lang);
}

function initLangButtons(){
  const lang = getLang();
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    const bLang = btn.getAttribute("data-lang");
    btn.classList.toggle("active", bLang === lang);
    btn.addEventListener("click", ()=>{
      setLang(bLang);
      // reload to re-render strings
      location.reload();
    });
  });
}

function go(path){
  location.href = path;
}

function fmt(num, digits=2){
  const n = Number(num);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}


function applyUnitYearElements(){
  const lang = getLang();
  const unit = (lang === "en") ? " tCO2/year" : " tCO2/έτος";
  document.querySelectorAll(".unitYear").forEach(el=>{
    el.textContent = unit;
  });
}
