// open default email app with prefilled contact message
function sendMail(event) {
    if (event) {
        event.preventDefault();
    }

    // Validation
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const number = document.getElementById("number").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !number || !subject || !message) {
        alert(t("alert.fillAll"));
        return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert(t("alert.invalidEmail"));
        return;
    }

    const to = "jameskamzk@gmail.com";
    const emailSubject = `[Portfolio] ${subject}`;
    const emailBody =
        `Nom: ${name}\n` +
        `Email: ${email}\n` +
        `Telephone: ${number}\n\n` +
        `Message:\n${message}`;

    const mailtoUrl =
        `mailto:${to}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoUrl;
}

// text change 
let textChangeIntervalId = null;
let currentWordIndex = 0;

function initTextChange() {
    const contents = document.querySelectorAll(".content");
    if (!contents || contents.length === 0) return;

    if (textChangeIntervalId) {
        clearInterval(textChangeIntervalId);
        textChangeIntervalId = null;
    }

    contents.forEach((content) => {
        const letters = content.textContent.split("");
        content.textContent = "";
        letters.forEach((letter) => {
            const span = document.createElement("span");
            span.textContent = letter;
            span.className = "letter";
            content.append(span);
        });
    });

    currentWordIndex = 0;
    const maxWordIndex = contents.length - 1;
    contents[currentWordIndex].style.opacity = "1";

    const changeText = () => {
        const currentWord = contents[currentWordIndex];
        const nextWord = currentWordIndex === maxWordIndex ? contents[0] : contents[currentWordIndex + 1];

        Array.from(currentWord.children).forEach((letter, i) => {
            setTimeout(() => {
                letter.className = "letter out";
            }, i * 80);
        });

        nextWord.style.opacity = "1";
        Array.from(nextWord.children).forEach((letter, i) => {
            letter.className = "letter behind";
            setTimeout(() => {
                letter.className = "letter in";
            }, 340 + i * 80);
        });

        currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
    };

    changeText();
    textChangeIntervalId = setInterval(changeText, 3000);
}

// i18n (FR/EN)
const I18N = {
    fr: {
        "nav.home": "Accueil",
        "nav.skills": "Compétences",
        "nav.services": "Services",
        "nav.portfolio": "Portfolio",
        "nav.about": "À propos",
        "nav.contact": "Contact",

        "home.title": "Salut, je suis Koffi Jacques Amouzou",
        "home.iam": "Je suis",
        "home.role1": "Développeur\u00A0Full-Stack",
        "home.role2": "Créateur\u00A0de\u00A0SaaS",
        "home.role3": "Développeur\u00A0Odoo",
        "home.role4": "Intégrateur\u00A0IA",
        "home.subtitle": "Vous avez un projet d'application web ou de SaaS ? Je le conçois et le mets en ligne, connecté à Odoo et boosté par l'IA, pour automatiser votre gestion et vendre plus.",
        "home.locationLabel": "Localisation :",
        "home.locationValue": "Casablanca, Maroc",
        "home.statusLabel": "Statut :",
        "home.statusValue": "Disponible en freelance",
        "home.downloadCv": "Télécharger mon CV",
        "home.viewLinkedin": "Voir mon LinkedIn",

        "skills.kicker": "Techniques et Professionnelles",
        "skills.title": "Mes compétences",
        "skills.techTitle": "Compétences Techniques",
        "skills.softTitle": "Compétences Professionnelles",
        "skills.soft.autonomy": "Autonomie",
        "skills.soft.creativity": "Créativité",
        "skills.soft.teamwork": "Travail en équipe",
        "skills.soft.communication": "Communication",

        "services.kicker": "Accompagnement sur mesure",
        "services.title": "Ce que je propose",
        "services.webapps.title": "Applications web & SaaS",
        "services.webapps.desc": "De l'idée à la mise en ligne : plateformes multi-utilisateurs, tableaux de bord, rôles et permissions, paiements en ligne. Une base fiable et sécurisée, avec Next.js, React, Django et FastAPI.",
        "services.odoo.desc": "Votre application connectée à votre gestion : configuration d'Odoo, modules sur mesure, rapports, intégrations API et correction de bugs.",
        "services.api.title": "API & backend",
        "services.api.desc": "API REST sécurisées avec Django REST Framework ou FastAPI, pour relier votre application à vos outils, partenaires et services.",
        "services.ai.title": "IA & chatbots",
        "services.ai.desc": "Chatbots IA sur WhatsApp, Telegram ou votre site, génération de contenu et automatisation des tâches répétitives, branchés sur vos outils.",
        "common.cta": "Rendez-Vous",

        "portfolio.kicker": "Projets récents",
        "portfolio.title": "Mes réalisations",
        "portfolio.filters.all": "Tous",
        "portfolio.filters.web": "App. Web",
        "portfolio.filters.api": "API & Backend",
        "portfolio.filters.odoo": "Odoo",
        "portfolio.inProgress": "En cours de développement · bientôt en ligne",

        "about.kicker": "À propos",
        "about.title": "A propos de moi",
        "about.subtitle": "Profil professionnel",
        "about.p1": "Je suis développeur Full-Stack : je conçois et je mets en ligne des applications web et des SaaS sur mesure, de l'idée au produit utilisé par vos clients. Je les connecte à Odoo et j'y intègre l'IA quand cela fait gagner du temps à votre entreprise.",
        "about.p2": "En 4 ans, j'ai livré plus de 15 projets : plateformes e-commerce multi-boutiques, marketplaces multi-vendeurs, impression à la demande, ERP Odoo, chatbots IA. Je clarifie le besoin par écrit, je livre par étapes que vous pouvez tester, et je pense la sécurité dès le départ.",
        "about.p3": "Vous avez un projet ? Écrivez-moi : je vous réponds sous 48 h avec une première proposition.",
        "about.more": "Voir plus !",
        "about.exp": "Années d'expérience",
        "about.projects": "Projets réalisés",
        "about.specialties": "Spécialités principales",

        "contact.kicker": "Une idée, un projet ?",
        "contact.title": "Contactez-moi",
        "contact.name": "Votre Nom",
        "contact.email": "Votre Email",
        "contact.phone": "Numéro de Telephone",
        "contact.subject": "Votre sujet",
        "contact.messagePlaceholder": "Votre message",
        "contact.send": "Envoyer",

        "alert.fillAll": "❌ Veuillez remplir tous les champs du formulaire",
        "alert.invalidEmail": "❌ Veuillez entrer une adresse email valide",
    },
    en: {
        "nav.home": "Home",
        "nav.skills": "Skills",
        "nav.services": "Services",
        "nav.portfolio": "Portfolio",
        "nav.about": "About",
        "nav.contact": "Contact",

        "home.title": "Hi, I'm Koffi Jacques Amouzou",
        "home.iam": "I'm",
        "home.role1": "Full-Stack\u00A0Developer",
        "home.role2": "SaaS\u00A0Builder",
        "home.role3": "Odoo\u00A0Developer",
        "home.role4": "AI\u00A0Integrator",
        "home.subtitle": "Got a web app or SaaS idea? I design it and take it live, connected to Odoo and powered by AI, so you can automate your operations and sell more.",
        "home.locationLabel": "Location:",
        "home.locationValue": "Casablanca, Morocco",
        "home.statusLabel": "Status:",
        "home.statusValue": "Available for freelance",
        "home.downloadCv": "Download my CV",
        "home.viewLinkedin": "View my LinkedIn",

        "skills.kicker": "Technical and Professional",
        "skills.title": "My skills",
        "skills.techTitle": "Technical skills",
        "skills.softTitle": "Professional skills",
        "skills.soft.autonomy": "Autonomy",
        "skills.soft.creativity": "Creativity",
        "skills.soft.teamwork": "Teamwork",
        "skills.soft.communication": "Communication",

        "services.kicker": "Tailored support",
        "services.title": "What I offer",
        "services.webapps.title": "Web apps & SaaS",
        "services.webapps.desc": "From idea to launch: multi-user platforms, dashboards, roles and permissions, online payments. A reliable, secure foundation built with Next.js, React, Django and FastAPI.",
        "services.odoo.desc": "Your app connected to your back office: Odoo configuration, custom modules, reports, API integrations and bug fixing.",
        "services.api.title": "API & backend",
        "services.api.desc": "Secure REST APIs with Django REST Framework or FastAPI, connecting your app to your tools, partners and services.",
        "services.ai.title": "AI & chatbots",
        "services.ai.desc": "AI chatbots on WhatsApp, Telegram or your website, content generation and automation of repetitive tasks, connected to your tools.",
        "common.cta": "Book a call",

        "portfolio.kicker": "Recent projects",
        "portfolio.title": "My work",
        "portfolio.filters.all": "All",
        "portfolio.filters.web": "Web apps",
        "portfolio.filters.api": "API & Backend",
        "portfolio.filters.odoo": "Odoo",
        "portfolio.inProgress": "In development · coming soon",

        "about.kicker": "About",
        "about.title": "About me",
        "about.subtitle": "Professional profile",
        "about.p1": "I'm a Full-Stack developer: I design and launch custom web apps and SaaS products, from the idea to a product your customers use. I connect them to Odoo and add AI wherever it saves your business time.",
        "about.p2": "Over 4 years I've delivered 15+ projects: multi-store e-commerce platforms, multi-vendor marketplaces, print on demand, Odoo ERP, AI chatbots. I clarify requirements in writing, deliver in stages you can test, and build with security in mind from day one.",
        "about.p3": "Got a project? Drop me a line: I'll reply within 48 hours with a first proposal.",
        "about.more": "See more!",
        "about.exp": "Years of experience",
        "about.projects": "Projects completed",
        "about.specialties": "Main specialties",

        "contact.kicker": "An idea, a project?",
        "contact.title": "Contact me",
        "contact.name": "Your name",
        "contact.email": "Your email",
        "contact.phone": "Phone number",
        "contact.subject": "Subject",
        "contact.messagePlaceholder": "Your message",
        "contact.send": "Send",

        "alert.fillAll": "❌ Please fill in all form fields",
        "alert.invalidEmail": "❌ Please enter a valid email address",
    },
};

function getCurrentLang() {
    const saved = localStorage.getItem("lang");
    if (saved === "fr" || saved === "en") return saved;

    const browserLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (browserLang.startsWith("fr")) return "fr";
    return "en";
}

function t(key) {
    const lang = getCurrentLang();
    return (I18N[lang] && I18N[lang][key]) || key;
}

function applyTranslations(lang) {
    if (!lang || (lang !== "fr" && lang !== "en")) lang = "fr";

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const value = (I18N[lang] && I18N[lang][key]) || null;
        if (!value) return;
        el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        const value = (I18N[lang] && I18N[lang][key]) || null;
        if (!value) return;
        el.setAttribute("placeholder", value);
    });

    initTextChange();
}

const languageSelect = document.getElementById("languages-select");
if (languageSelect) {
    const initialLang = getCurrentLang();
    languageSelect.value = initialLang;
    applyTranslations(initialLang);

    languageSelect.addEventListener("change", (e) => {
        const newLang = e.target.value === "en" ? "en" : "fr";
        localStorage.setItem("lang", newLang);
        applyTranslations(newLang);
    });
}

initTextChange();

// skill circle
const circles = document.querySelectorAll('.circle');
circles.forEach(elem=>{
    var dots = elem.getAttribute("data-dots");
    var marked = elem.getAttribute("data-percent" );
    var percent = Math.floor(dots*marked/100);
    var points = "";
    var rotate = 360 / dots;

    for (let i = 0; i < dots ; i++) {
        points += `<div class="points" style="--i:${i}; --rot:${rotate}deg;"></div>`;
    }
    elem.innerHTML = points;
    const pointsMarked = elem.querySelectorAll('.points');
    for (let i = 0; i < percent; i++) {
        pointsMarked[i].classList.add('marked');
    };
});

// mix it up portfolio section
if (typeof mixitup === 'function' && document.querySelector('.portfolio-gallery')) {
    var mixer = mixitup('.portfolio-gallery');
}


// active menu
let menuLi = document.querySelectorAll('header ul li a');
let section = document.querySelectorAll('section')

function activeMenu(){
    let len = section.length;
    while (--len && window.scrollY + 97 < section[len].offsetTop) {}
    menuLi.forEach(sec => sec.classList.remove("active"));
    menuLi[len].classList.add("active");
}

activeMenu();
window.addEventListener("scroll", activeMenu)

// sticky navbar
const header = document.querySelector("header");
window.addEventListener("scroll",function(){
    header.classList.toggle("sticky",window.scrollY > 50)
})

// toggle icon navbar
let menuIcon = document.querySelector("#icon-menu");
let navlist = document.querySelector(".navbar");

if (menuIcon && navlist) {
    menuIcon.onclick =()=>{
        menuIcon.classList.toggle("bx-x");
        navlist.classList.toggle("open");
    }
}


window.onscroll=()=>{
    if (menuIcon && navlist) {
        menuIcon.classList.remove("bx-x");
        navlist.classList.remove("open");
    }
}

// paralax
const scrollScale = document.querySelectorAll(".scroll-scale");
const scrollBottom = document.querySelectorAll(".scroll-bottom");
const scrollTop = document.querySelectorAll(".scroll-top");

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
            if (entry.isIntersecting) {
                entry.target.classList.add('show-items');
            }else {
                entry.target.classList.remove("show-items");
            }
        });
    });

    scrollScale.forEach((el)=>observer.observe(el));
    scrollBottom.forEach((el)=>observer.observe(el));
    scrollTop.forEach((el)=>observer.observe(el));
} else {
    scrollScale.forEach((el)=>el.classList.add('show-items'));
    scrollBottom.forEach((el)=>el.classList.add('show-items'));
    scrollTop.forEach((el)=>el.classList.add('show-items'));
}

// dark mode
let darkModeIcon = document.querySelector('#darkmode-icon');
if (darkModeIcon) {
    darkModeIcon.onclick =()=>{
        darkModeIcon.classList.toggle('bxs-sun');
        document.body.classList.toggle('darkmode')
    }
}

//popup
// const overlay = document.getElementById('overlay');
//         const popup = document.getElementById('popup');
//         const openPopupButton = document.getElementById('openPopup');
//         const closePopupButton = document.getElementById('closePopup');
//         const prevButton = document.getElementById('prevButton');
//         const nextButton = document.getElementById('nextButton');
//         const images = ['img/1.jpg', 'img/12.jpg', 'img/3.jpg']; 

//         let currentImageIndex = 0;

//         // Fonction pour ouvrir le popup
//         openPopupButton.addEventListener('click', () => {
//             overlay.style.display = 'block';
//             popup.style.display = 'block';
//             displayImage(currentImageIndex);
//         });

//         // Fonction pour fermer le popup
//         closePopupButton.addEventListener('click', () => {
//             overlay.style.display = 'none';
//             popup.style.display = 'none';
//         });

//         // Fonction pour afficher une image spécifique
//         function displayImage(index) {
//             const img = document.getElementById('popImage');
//             img.src = images[index];
//             img.onload = () => {
//                 popup.innerHTML = '';
//                 popup.appendChild(img);
//                 if (index > 0) {
//                     prevButton.style.display = 'block';
//                 } else {
//                     prevButton.style.display = 'none';
//                 }
//                 if (index < images.length - 1) {
//                     nextButton.style.display = 'block';
//                 } else {
//                     nextButton.style.display = 'none';
//                 }
//             };
//         }

//         // Fonction pour afficher l'image précédente
//         prevButton.addEventListener('click', () => {
//             if (currentImageIndex > 0) {
//                 currentImageIndex--;
//                 displayImage(currentImageIndex);
//             }
//         });

//         // Fonction pour afficher l'image suivante
//         nextButton.addEventListener('click', () => {
//             if (currentImageIndex < images.length - 1) {
//                 currentImageIndex++;
//                 displayImage(currentImageIndex);
//             }
//         });
