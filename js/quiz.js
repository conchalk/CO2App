/* Αρχείο: js/quiz.js 
   Περιγραφή: Κώδικας Quiz με 10 ενσωματωμένες ερωτήσεις
*/

// --- ΔΕΔΟΜΕΝΑ ΕΡΩΤΗΣΕΩΝ ---
const questionsData = [
  {
    "id": 1,
    "question": {
      "gr": "Το ανθρακικό αποτύπωμα εκφράζεται σε τόνους CO₂ και άλλες φορές σε τόνους CO₂e. Ποια είναι η διαφορά;",
      "en": "The carbon footprint is sometimes expressed in tons of CO₂ and other times in tons of CO₂e. What is the difference?"
    },
    "img": "../assets/questions/img/12.png",
    "a1": {
      "gr": "Δεν υπάρχει διαφορά, είναι απλώς δύο διαφορετικοί τρόποι γραφής του ίδιου πράγματος.",
      "en": "There is no difference, they are just two ways of writing the same thing."
    },
    "a2": {
      "gr": "Το CO₂e περιλαμβάνει και άλλα αέρια του θερμοκηπίου, μετατρέποντάς τα σε ισοδύναμη ποσότητα CO₂.",
      "en": "CO₂e includes other greenhouse gases by converting them into an equivalent amount of CO₂."
    },
    "a3": {
      "gr": "Το CO₂ αφορά μόνο φυσικές εκπομπές, ενώ το CO₂e χρησιμοποιείται μόνο για βιομηχανικές εκπομπές.",
      "en": "CO₂ refers only to natural emissions, while CO₂e is used only for industrial emissions."
    },
    "right": 2,
    "explanation": {
      "gr": "Το CO₂ (διοξείδιο του άνθρακα) είναι ένα μόνο από τα αέρια του θερμοκηπίου. Όμως, υπάρχουν και άλλα ισχυρά αέρια, όπως το μεθάνιο (CH₄). Το CO₂e (ισοδύναμο CO₂) επιτρέπει να εκφράσουμε την επίδραση αυτών των αερίων σε **ισοδύναμους τόνους CO₂**. Για παράδειγμα, 1 τόνος CH₄ ισοδυναμεί με περίπου 27–30 τόνους CO₂e. Έτσι, το αποτύπωμα σε CO₂e περιλαμβάνει το **συνολικό αποτέλεσμα όλων των αερίων του θερμοκηπίου** και όχι μόνο του CO₂.",
      "en": "CO₂ (carbon dioxide) is only one of the greenhouse gases. Others, like methane (CH₄) are much stronger. CO₂e (carbon dioxide equivalent) allows us to express the effect of these gases in **equivalent tons of CO₂**. For example, 1 ton of CH₄ equals about 27–30 tons of CO₂e. Thus, the footprint in CO₂e reflects the **combined effect of all greenhouse gases**, not just CO₂."
    },
    "url": "https://ourworldindata.org/greenhouse-gas-emissions#how-do-we-quantify-greenhouse-gas-emissions"
  },
  {
    "id": 2,
    "question": {
      "gr": "Ποιος τομέας συμβάλλει κατά μέσο όρο περισσότερο στο συνολικό ανθρακικό αποτύπωμα (CO₂) ανά κάτοικο στην Ελλάδα;",
      "en": "Which sector contributes most to the total per capita carbon footprint (CO₂) in Greece?"
    },
    "img": "../assets/questions/img/1.png",
    "a1": { "gr": "Διατροφή", "en": "Food" },
    "a2": { "gr": "Μεταφορές", "en": "Transport" },
    "a3": { "gr": "Κατανάλωση ενέργειας σε οικιακή χρήση", "en": "Household Energy" },
    "right": 2,
    "explanation": {
      "gr": "O τομέας “μεταφορές” περιλαμβάνει τις μετακινήσεις μας με ΙΧ ή λεωφορείο, αλλά και το αποτύπωμα από τη διανομή αγαθών και εμπορευμάτων που φτάνουν στο σπίτι μας ή στο σούπερ μάρκετ (logistics). Συνυπολογίζοντας λοιπόν το σύνολο του μεταφορικού φορτίου, το συνολικό αποτύπωμα μεταφορών ανά κάτοικο ξεπερνά όλους τους άλλους τομείς.",
      "en": "The 'transportation' sector includes our travel by car or bus, but also the footprint from the distribution of goods and merchandise that arrive at our homes or supermarkets (logistics). Taking into account the total transport load, the overall transport footprint per capita exceeds all other sectors."
    },
    "url": "https://ourworldindata.org/co2-emissions-from-transport"
  },
  {
    "id": 3,
    "question": {
      "gr": "Ποια από τις παρακάτω πράξεις μειώνει το προσωπικό σου αποτύπωμα CO₂ περισσότερο;",
      "en": "Which of the following actions reduces your personal CO₂ footprint the most?"
    },
    "img": "../assets/questions/img/1.png",
    "a1": { "gr": "Αντικατάσταση λαμπτήρων με LED", "en": "Replacing all bulbs with LEDs" },
    "a2": { "gr": "Μείωση κατανάλωσης κρέατος", "en": "Reducing meat consumption" },
    "a3": { "gr": "Μείωση κατανάλωσης εμφιαλωμένου νερού", "en": "Reducing bottled water consumption" },
    "right": 2,
    "explanation": {
      "gr": "Η διατροφή παίζει τεράστιο ρόλο στο συνολικό περιβαλλοντικό μας αποτύπωμα. Η παραγωγή ζωικών προϊόντων απαιτεί τεράστιες ποσότητες ενέργειας, νερού και εκτάσεων γης. Μια έντονα κρεοφαγική διατροφή μπορεί να φτάνει 2,5–3 τόνους CO₂eq/έτος – όσο το αποτύπωμα από τη χρήση ΙΧ! Μειώνοντας το κρέας, το ετήσιο αποτύπωμα μειώνεται δραστικά.",
      "en": "Diet plays a huge role in our overall environmental footprint. The production of animal products requires enormous amounts of energy, water, and land. A heavily meat-based diet can reach 2.5–3 tons CO₂eq/year—as much as the footprint from using a car! Reducing meat drastically cuts the annual footprint."
    },
    "url": "https://ourworldindata.org/food-choice-vs-eating-local"
  },
  {
    "id": 4,
    "question": {
      "gr": "Ποια μετακίνηση έχει το χαμηλότερο κατά κεφαλήν μέσο ανθρακικό αποτύπωμα ανά χιλιόμετρο στον κόσμο;",
      "en": "Which mode of transport has the lowest carbon footprint per capita per kilometre?"
    },
    "img": "../assets/questions/img/1.png",
    "a1": { "gr": "Ηλεκτρικό ποδήλατο", "en": "Electric Bicycle" },
    "a2": { "gr": "ΙΧ βενζίνης", "en": "Petrol car" },
    "a3": { "gr": "Αεροπορικό ταξίδι", "en": "Airport flight" },
    "right": 3,
    "explanation": {
      "gr": "Η λέξη-κλειδί είναι το «κατά κεφαλήν»: μετράμε το μέσο αποτύπωμα ανά κάτοικο και όχι ανά επιβάτη-χιλιόμετρο. Αν και τα αεροπορικά ταξίδια έχουν υψηλές εκπομπές ανά χιλιόμετρο, λίγοι άνθρωποι ταξιδεύουν συχνά με αεροπλάνο. Έτσι, μοιρασμένα σε όλο τον πληθυσμό, το μέσο αποτύπωμα από τις πτήσεις είναι χαμηλότερο σε σχέση με τη συχνή χρήση ΙΧ ή ποδηλάτου.",
      "en": "The key word is 'per capita': we measure the average footprint per person, not per passenger-kilometre. Although flights emit a lot per kilometre, relatively few people fly often. Spread across the whole population, the per capita footprint of flying is lower than that of frequent car use or cycling."
    },
    "url": "https://www.iea.org"
  },
  {
    "id": 5,
    "question": {
      "gr": "Τι ρόλο παίζουν στην εκπομπή θερμοκηπιακών αερίων τα απορρίματα των τροφίμων;",
      "en": "What role does food waste play in greenhouse gas emissions?"
    },
    "img": "../assets/questions/img/1.png",
    "a1": { "gr": "Kανέναν ρόλο ή σχεδόν κανένα, η συμβολή τους είναι αμελητέα", "en": "No role or almost none, their contribution is negligible" },
    "a2": { "gr": "Σημαντικό, η απόρριψη τροφίμων παράγει περισσότερο CO2 από τις μεταφορές", "en": "Important role, food waste produces more CO2 than transport" },
    "a3": { "gr": "Όχι τόσο μικρό, η σπατάλη αυτή προσθέτει CO2 στην ατμόσφαιρα περισσότερο από εκείνον που παράγεται από τις αεροπορικές μεταφορές", "en": "Not so small a role, this waste adds more CO2 to the atmosphere than that produced by air transport" },
    "right": 3,
    "explanation": {
      "gr": "Περίπου το ένα τέταρτο των θερμίδων που παράγει ο κόσμος πετιέται ή σπαταλιέται. Υπολογίζεται ότι αυτά τα απορρίμματα ευθύνονται για το 6% της παγκόσμιας παραγωγής CO2, ποσότητα καθόλου αμελητέα, όταν οι αερομεταφορές ευθύνονται για περίπου 2,5%.",
      "en": "About a quarter of the calories the world produces are thrown away or wasted. It is estimated that this waste is responsible for 6% of global CO2 production, a far from negligible amount when air transport is responsible for around 2.5%."
    },
    "url": "https://ourworldindata.org/food-waste-emissions"
  },
  {
    "id": 6,
    "question": {
      "gr": "Αν δύο οδηγοί ο ένας στην Ελλάδα και ο άλλος στην Κύπρο οδηγούν όμοια ηλεκτρικά αυτοκίνητα για 100 km αφήνουν το ίδιο περιβαλλοντικό αποτύπωμα;",
      "en": "If two drivers, one in Greece and one in Cyprus, drive the same electric car for 100 km do they leave the same environmental footprint?"
    },
    "img": "../assets/questions/img/1.png",
    "a1": { "gr": "Ναι, γιατί το ηλ. αυτοκίνητο δεν παράγει CO2 αφού δεν έχει εξάτμιση", "en": "Yes, because EVs have no tailpipe emissions." },
    "a2": { "gr": "Όχι, γιατί το αποτύπωμα του εξαρτάται από τον τρόπο με τον οποίο παράγεται το ηλεκτρικό ρεύμα που φορτίζει την μπαταρία του.", "en": "No, because its footprint depends on how the electricity that charges its battery is generated." },
    "a3": { "gr": "Ναι, γιατί αφού είναι όμοια λειτουργούν με τον ίδιο τρόπο.", "en": "Yes, because since they're identical they work in the same way." },
    "right": 2,
    "explanation": {
      "gr": "Η ηλεκτρική ενέργεια δεν είναι από μόνη της “καθαρή” ή “βρώμικη” — εξαρτάται από το ενεργειακό μίγμα της χώρας. Στην Ελλάδα, περίπου 50% της ηλεκτρικής ενέργειας παράγεται από ανανεώσιμες πηγές, ενώ στην Κύπρο το ποσοστό είναι χαμηλότερο (μεγαλύτερη εξάρτηση από πετρέλαιο). Άρα, ένα EV που φορτίζεται στην Κύπρο έχει συχνά υψηλότερο έμμεσο αποτύπωμα CO₂.",
      "en": "Electricity is not inherently “clean” or “dirty” — it depends on the energy mix of the country. In Greece, about 50% of electricity comes from renewables, while in Cyprus, the percentage is lower (higher reliance on oil). So, an EV charged in Cyprus often has a higher indirect CO₂ footprint."
    },
    "url": "https://ourworldindata.org/grapher/share-electricity-renewables?time=latest&mapSelect=CYP~GRC"
  },
  {
    "id": 7,
    "question": {
      "gr": "Η αύξηση του CO₂ στην ατμόσφαιρα επηρεάζει τη θαλάσσια ζωή;",
      "en": "Does the increase of atmospheric CO₂ affect marine life?"
    },
    "img": "../assets/questions/img/11.png",
    "a1": { "gr": "Όχι, γιατί το CO₂ δεν διαλύεται εύκολα στο νερό.", "en": "No, because CO₂ does not dissolve easily in water." },
    "a2": { "gr": "Ναι, γιατί το CO₂ αυξάνει την οξύτητα των ωκεανών και δυσκολεύει τη ζωή οργανισμών με κελύφη.", "en": "Yes, because CO₂ increases ocean acidity and harms organisms with shells." },
    "a3": { "gr": "Όχι, γιατί οι ωκεανοί απορροφούν CO₂ χωρίς να αλλάζει η χημεία τους.", "en": "No, because oceans absorb CO₂ without changing their chemistry." },
    "right": 2,
    "explanation": {
      "gr": "Η αύξηση του CO₂ στην ατμόσφαιρα οδηγεί στην απορρόφησή του από τους ωκεανούς, όπου σχηματίζεται ανθρακικό οξύ (οξίνιση των ωκεανών). Αυτό δυσκολεύει την κατασκευή κελυφών και σκελετών σε κοράλλια, οστρακοειδή και πλαγκτόν.",
      "en": "The increase in atmospheric CO₂ leads to more CO₂ being absorbed by the oceans, forming carbonic acid (ocean acidification). This makes it harder for corals, shellfish, and plankton to build shells and skeletons."
    },
    "url": "https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification"
  },
  {
    "id": 8,
    "question": {
      "gr": "Σε ένα μέσο ελληνικό σπίτι, ποια επιλογή μειώνει περισσότερο τις ετήσιες εκπομπές CO₂;",
      "en": "In an average Greek household, which option reduces annual CO₂ emissions the most?"
    },
    "img": "../assets/questions/img/13.png",
    "a1": { "gr": "Αντικατάσταση όλων των λαμπτήρων με LED.", "en": "Replacing all light bulbs with LEDs." },
    "a2": { "gr": "Εγκατάσταση καλής θερμομόνωσης.", "en": "Installing proper thermal insulation." },
    "a3": { "gr": "Απενεργοποίηση συσκευών από την πρίζα όταν δεν χρησιμοποιούνται.", "en": "Unplugging devices when not in use." },
    "right": 2,
    "explanation": {
      "gr": "Η θέρμανση και ψύξη καταναλώνει το μεγαλύτερο ποσοστό ενέργειας σε ένα ελληνικό σπίτι. Η σωστή θερμομόνωση μπορεί να μειώσει τις ενεργειακές ανάγκες για θέρμανση/ψύξη κατά 20–40%, οδηγώντας σε μεγάλη μείωση εκπομπών. Η αντικατάσταση λαμπτήρων και το κλείσιμο συσκευών βοηθούν, αλλά η εξοικονόμηση είναι μικρότερη.",
      "en": "Heating and cooling consume the largest share of household energy in Greece. Proper insulation can cut heating/cooling needs by 20–40%, leading to significant emission reductions. Switching to LEDs and unplugging devices helps, but the savings are smaller."
    },
    "url": "https://www.eea.europa.eu/en/analysis/indicators/final-energy-consumption-in-households"
  },
  {
    "id": 9,
    "question": {
      "gr": "Τι αφήνει περίπου το ίδιο αποτύπωμα CO₂: η μεταφορά ενός laptop (1 κιλό) από την Κίνα στην Ευρώπη με πλοίο (διάρκεια ~1 εβδομάδα) ή η κατανάλωση μιας τηλεόρασης σε αναμονή για μια εβδομάδα;",
      "en": "Which has about the same CO₂ footprint: shipping a 1 kg laptop from China to Europe by ship (~1 week) or a TV in standby mode for one week?"
    },
    "img": "../assets/questions/img/16.png",
    "a1": { "gr": "Η μεταφορά του laptop από την Κίνα", "en": "Shipping the laptop from China" },
    "a2": { "gr": "Η τηλεόραση σε αναμονή για μια εβδομάδα", "en": "The TV in standby for one week" },
    "a3": { "gr": "Έχουν περίπου το ίδιο αποτύπωμα", "en": "They have about the same footprint" },
    "right": 3,
    "explanation": {
      "gr": "Η μεταφορά ενός laptop βάρους 1 κιλού με πλοίο από την Κίνα στην Ευρώπη εκπέμπει περίπου 0,2 κιλά CO₂. Μια τηλεόραση σε αναμονή για μια εβδομάδα καταναλώνει ρεύμα που αντιστοιχεί περίπου στην ίδια ποσότητα CO₂. Αυτό δείχνει ότι η «αθώα» αναμονή μιας συσκευής είναι σημαντική.",
      "en": "Shipping a 1 kg laptop from China to Europe by ship emits roughly 0.2 kg of CO₂. A TV in standby mode for one week consumes electricity corresponding to about the same amount of CO₂. This shows that the 'innocent' standby mode is significant."
    },
    "url": "https://ourworldindata.org/food-transport"
  },
  {
    "id": 10,
    "question": {
      "gr": "Αν ένα στρέμμα τροπικού δάσους αποψιλωθεί και μετατραπεί σε γεωργική γη, τι συμβαίνει με το ισοδύναμο CO₂ στην ατμόσφαιρα;",
      "en": "If one hectare of tropical forest is cleared and converted into farmland, what happens to the CO₂ equivalent in the atmosphere?"
    },
    "img": "../assets/questions/img/17.png",
    "a1": { "gr": "Μειώνεται, γιατί τα καλλιεργούμενα φυτά απορροφούν CO₂.", "en": "It decreases, because crops also absorb CO₂." },
    "a2": { "gr": "Αυξάνεται, γιατί απελευθερώνεται άνθρακας από το δάσος και μειώνεται η δυνατότητα απορρόφησης.", "en": "It increases, because carbon stored in the forest is released and the absorption capacity is reduced." },
    "a3": { "gr": "Μένει περίπου σταθερό, γιατί θεωρητικά τα δέντρα που χάνονται αντικαθίστανται από τις καλλιέργειες.", "en": "It stays roughly the same, since in theory the lost trees are replaced by crops." },
    "right": 2,
    "explanation": {
      "gr": "Τα τροπικά δάση είναι τεράστιες αποθήκες άνθρακα. Όταν αποψιλώνονται, ο άνθρακας που είναι αποθηκευμένος στο ξύλο και στο έδαφος απελευθερώνεται ως CO₂. Ταυτόχρονα χάνεται η ικανότητα απορρόφησης. Η γεωργική γη αποθηκεύει πολύ λιγότερο άνθρακα.",
      "en": "Tropical forests are massive carbon stores. When cleared, the carbon locked in trees and soils is released as CO₂. At the same time, the capacity to absorb CO₂ is lost. Farmland stores much less carbon."
    },
    "url": "https://ourworldindata.org/land-use-change-and-forestry"
  }
];

// --- ΛΕΙΤΟΥΡΓΙΑ QUIZ ---
let idx = 0;
let score = 0;
let answers = []; 
const QUIZ_SCORE_KEY = "quizScore";

function getQuizLang() {
  if (typeof getLang === 'function') {
    return getLang() === "el" ? "gr" : "en";
  }
  return "gr";
}

// Δημιουργία element εικόνας αν δεν υπάρχει
function ensureImgElement() {
    const qText = document.getElementById("question");
    if (!qText) return null;
    
    let imgEl = document.getElementById("quizImg");
    if (!imgEl) {
        imgEl = document.createElement("img");
        imgEl.id = "quizImg";
        imgEl.style.maxWidth = "100%";
        imgEl.style.height = "auto";
        imgEl.style.marginBottom = "15px";
        imgEl.style.borderRadius = "8px";
        imgEl.style.display = "none";
        // Εισαγωγή πριν το κείμενο της ερώτησης
        qText.parentNode.insertBefore(imgEl, qText);
    }
    return imgEl;
}

function renderQuiz(){
  const lang = getQuizLang();
  
  if (idx >= questionsData.length) {
    showFinishScreen(lang);
    return;
  }

  const q = questionsData[idx];
  const hasAnswered = answers[idx] !== null && answers[idx] !== undefined;

  // UI Updates
  const qLabel = document.getElementById("qLabel");
  const sLabel = document.getElementById("scoreLabel");
  
  if(qLabel) qLabel.textContent = (lang==="gr" ? "Ερ: " : "Q: ") + (idx+1) + "/" + questionsData.length;
  if(sLabel) sLabel.textContent = (lang==="gr" ? "Σκορ: " : "Score: ") + score;

  const qText = document.getElementById("question");
  const o1 = document.getElementById("opt1");
  const o2 = document.getElementById("opt2");
  const o3 = document.getElementById("opt3");
  const hintEl = document.getElementById("hint");

  if(!qText || !o1 || !o2 || !o3) {
      console.error("Missing HTML elements for quiz");
      return;
  }

  // Διαχείριση Εικόνας
  const imgEl = ensureImgElement();
  if (imgEl) {
      if (q.img) {
          imgEl.src = q.img;
          imgEl.style.display = "block";
      } else {
          imgEl.style.display = "none";
      }
  }

  qText.textContent = q.question[lang];
  o1.textContent = q.a1[lang];
  o2.textContent = q.a2[lang];
  o3.textContent = q.a3[lang];

  if (hasAnswered) {
      hintEl.textContent = "";
  } else {
      hintEl.textContent = (lang==="gr") ? "Επίλεξε τη σωστή απάντηση" : "Choose the correct answer";
  }

  // Reset Styles
  document.querySelectorAll(".optionText").forEach(o => 
    o.classList.remove("answerCorrect", "answerWrong", "answerChosen")
  );
  document.querySelectorAll(".choiceBtn").forEach(b => {
    b.classList.remove("locked");
    b.disabled = false;
  });

  if (hasAnswered) {
    const saved = answers[idx];
    showFeedback(saved.choice, saved.right, lang, false);
  } else {
    const ansCard = document.getElementById("answerCard");
    if(ansCard) ansCard.style.display = "none";
    
    const nextBtn = document.getElementById("btnNext");
    if(nextBtn) nextBtn.disabled = true;
  }

  const prevBtn = document.getElementById("btnPrev");
  if(prevBtn) prevBtn.disabled = (idx === 0);
}

function showFeedback(choice, right, lang, updateScore) {
  const elChoice = document.getElementById("opt" + choice);
  const elRight = document.getElementById("opt" + right);
  
  if(elChoice) elChoice.classList.add("answerChosen");
  if(elRight) elRight.classList.add("answerCorrect");
  
  if (choice !== right && elChoice) {
    elChoice.classList.add("answerWrong");
  }

  if (updateScore && choice === right) {
    score += 10;
    const sLabel = document.getElementById("scoreLabel");
    if(sLabel) sLabel.textContent = (lang==="gr" ? "Σκορ: " : "Score: ") + score;
  }

  document.querySelectorAll(".choiceBtn").forEach(b => {
    b.disabled = true;
    b.classList.add("locked");
  });

  const q = questionsData[idx];
  const card = document.getElementById("answerCard");
  const titleEl = document.getElementById("answerTitle");
  const explainEl = document.getElementById("answerExplain");
  const sourceEl = document.getElementById("answerSource");

  if(card && titleEl && explainEl) {
      titleEl.textContent = (choice === right) 
        ? (lang === "gr" ? "Σωστά!" : "Correct!") 
        : (lang === "gr" ? "Λάθος." : "Wrong.");
      
      explainEl.textContent = q.explanation[lang];
      
      if (sourceEl) {
          if (q.url) {
            sourceEl.innerHTML = `<a href="${q.url}" target="_blank">${lang==="gr"?"Πηγή":"Source"}</a>`;
          } else {
            sourceEl.textContent = "";
          }
      }
      card.style.display = "block";
  }

  const nextBtn = document.getElementById("btnNext");
  if(nextBtn) nextBtn.disabled = false;
}

function handleAnswer(choice) {
  if (idx >= questionsData.length) return;
  if (answers[idx]) return;

  const q = questionsData[idx];
  const right = Number(q.right); 
  const lang = getQuizLang();

  answers[idx] = {
    choice: choice,
    right: right,
    correct: (choice === right)
  };

  showFeedback(choice, right, lang, true);
}

function showFinishScreen(lang) {
  const card = document.querySelector(".quizCard");
  const choicesRow = document.getElementById("choicesRow");
  const navTop = document.querySelector(".quizNavTop");
  const ansCard = document.getElementById("answerCard");

  const totalPossible = questionsData.length * 10;
  let msg = "";
  if (score >= (totalPossible * 0.8)) msg = (lang==="gr") ? "Άριστα!" : "Excellent!";
  else if (score >= (totalPossible * 0.5)) msg = (lang==="gr") ? "Καλά τα πήγες!" : "Good job!";
  else msg = (lang==="gr") ? "Μπορείς και καλύτερα!" : "Keep trying!";

  if(card) {
      card.innerHTML = `
        <div style="text-align:center; padding: 20px;">
          <h2>${lang==="gr" ? "Τέλος Κουίζ" : "Quiz Finished"}</h2>
          <div style="font-size: 2em; font-weight:bold; margin: 20px 0; color:var(--primary);">
            ${score} / ${totalPossible}
          </div>
          <p>${msg}</p>
        </div>
      `;
  }
  
  if(choicesRow) {
      choicesRow.innerHTML = `
        <button class="choiceBtn choiceWide" id="restartBtn">${lang==="gr"?"Επανάληψη":"Restart"}</button>
      `;
      const rBtn = document.getElementById("restartBtn");
      if(rBtn) rBtn.addEventListener("click", () => location.reload());
  }

  if(ansCard) ansCard.style.display = "none";
  if(navTop) navTop.style.display = "none";

  localStorage.setItem(QUIZ_SCORE_KEY, score);
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initLangButtons === 'function') {
    initLangButtons();
  }

  answers = new Array(questionsData.length).fill(null);
  renderQuiz();

  document.querySelectorAll(".choiceBtn[data-choice]").forEach(b => {
    b.addEventListener("click", () => {
        handleAnswer(Number(b.dataset.choice));
    });
  });

  const btnNext = document.getElementById("btnNext");
  const btnPrev = document.getElementById("btnPrev");
  const btnClose = document.getElementById("btnAnswerClose");

  if(btnNext) {
      btnNext.addEventListener("click", () => {
        if (idx < questionsData.length) {
            idx++;
            renderQuiz();
        }
      });
  }

  if(btnPrev) {
      btnPrev.addEventListener("click", () => {
        if (idx > 0) {
            idx--;
            renderQuiz();
        }
      });
  }

  if(btnClose) {
      btnClose.addEventListener("click", () => {
         const ac = document.getElementById("answerCard");
         if(ac) ac.style.display = "none";
      });
  }
});
