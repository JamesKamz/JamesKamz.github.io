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
        alert("❌ Veuillez remplir tous les champs du formulaire");
        return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("❌ Veuillez entrer une adresse email valide");
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
let contents = document.querySelectorAll(".content");
contents.forEach((content)=>{
    let letters = content.textContent.split("");
    content.textContent="";
    letters.forEach((letter)=>{
        let span = document.createElement("span");
        span.textContent = letter;
        span.className = "letter";
        content.append(span);
    });
});

let currentWordIndex = 0;
let maxWordIndex = contents.length -1;
contents[currentWordIndex].style.opacity = '1';

let changeText = ()=>{
    let currentWord = contents[currentWordIndex];
    let nexWord = currentWordIndex === maxWordIndex ? contents[0] : contents[currentWordIndex + 1];
    Array.from(currentWord.children).forEach((letter,i)=>{
        setTimeout(()=>{
            letter.className = "letter out";
        },i*80);
    });
    nexWord.style.opacity = "1";
    Array.from(nexWord.children).forEach((letter,i)=>{
        letter.className = "letter behind";
        setTimeout(()=>{
            letter.className= "letter in";
        },340 + i*80);
    });
    currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1; 
}

changeText();
setInterval(changeText, 3000);

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
