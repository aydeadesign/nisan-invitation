/* ======================================================
    Enise Melda & Kürşat | Nişan Davetiyesi Website
    Entwickler: AydeaDesign
    Technologien: HTML • CSS • JavaScript
====================================================== */

/* ======================================================
   INITIALISIERUNG
   Referenzen auf wichtige HTML-Elemente
====================================================== */
const bgVideo = document.getElementById("background-video");
const closedEnvelope = document.getElementById("closedEnvelope");
const openEnvelope = document.getElementById("openEnvelope");
// Hintergrundmusik (derzeit deaktiviert)
// const music = document.getElementById("bgMusic");

/* ======================================================
   MOBILE VIEWPORT
   Behebt die 100vh-Problematik auf iOS und Android,
   damit die Hero-Sektion immer die korrekte Höhe hat.
====================================================== */
function setViewportHeight() {
    document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
    );
}

setViewportHeight();

window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);

/* ======================================================
   HERO
   Öffnet den Umschlag, startet die Animationen
   und blendet anschließend die Einladung ein.
====================================================== */
closedEnvelope.addEventListener("click",()=>{
    bgVideo.pause();
    //bgVideo.play().catch(() => {});
    bgVideo.play().catch(err => {
    console.log("Video konnte nicht gestartet werden:", err);
});

/*
--------------------------------------------------------
    Hintergrundmusik (deaktiviert)

    Zum Aktivieren:

    1. <audio id="bgMusic"> in index.html einkommentieren
    2. music-Konstante oben aktivieren
    3. Diesen Block wieder einkommentieren
--------------------------------------------------------

    music.volume = 0;
    music.play();
    musicButton.innerHTML =
    '<i data-lucide="volume-2"></i>';
    lucide.createIcons();
    let volume = 0;
    const fadeMusic = setInterval(() => {
    if(volume < 0.25){
        volume += 0.02;
        music.volume = volume;
    }else{
        clearInterval(fadeMusic);
    }
    },200);
*/

   closedEnvelope.classList.add("fade-out");
    setTimeout(()=>{
        closedEnvelope.style.display="none";
        openEnvelope.classList.remove("hidden");
        setTimeout(()=>{
            openEnvelope.classList.add("show");
            /*
            document
            .getElementById("musicToggle")
            .classList.add("show");
            showMusicButton();
            */
            for(let i=0;i<15;i++){
                setTimeout(createPetal,i*180);
            }
            setTimeout(()=>{
            document.querySelector(".scroll-hint")
            .classList.add("show");
            },3000);
    },300);
},1000);
});

/* ======================================================
   COUNTDOWN
   Aktualisiert die verbleibende Zeit bis zum
   Verlobungstag im Sekundentakt.
====================================================== */
const weddingDate = new Date("2026-08-30T16:00:00").getTime();

let countdownInterval;
function updateCountdown(){
    const now = Date.now();
    const distance = weddingDate - now;

    if(distance <= 0){
        document.getElementById("days").textContent = "0";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        if(countdownInterval) clearInterval(countdownInterval);
        return;
    }

    const days = Math.floor(
        distance / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) 
        / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
        (distance % (1000 * 60 * 60))
        / (1000 * 60)
    );
    const seconds = Math.floor(
        (distance % (1000 * 60))
        / 1000
    );

    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;
}

updateCountdown();
setInterval(updateCountdown,1000);

/* ======================================================
   SCROLL-ANIMATIONEN
   Blendet Abschnitte beim Scrollen weich ein.
====================================================== */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll(){
    for(let i = 0; i < reveals.length; i++){
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const visiblePoint = 120;

        if(elementTop < windowHeight - visiblePoint){
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener(
    "scroll",
    revealOnScroll
);

revealOnScroll();

/* ======================================================
   FLOATING NAVIGATION
   Zeigt die Navigation erst nach dem Hero-Bereich an.
====================================================== */
const nav = document.querySelector(".floating-nav");

window.addEventListener("scroll",()=>{
    if(window.scrollY > window.innerHeight * 0.6){
        nav.classList.add("show");
    } else {
        nav.classList.remove("show");
    }
});

/* ======================================================
   BLÜTENANIMATION
   Erstellt beim Öffnen des Umschlags fallende Blüten.
====================================================== */
const petalImages = [
    "assets/petals/petal1.png",
    "assets/petals/petal2.png",
    "assets/petals/petal3.png",
    "assets/petals/petal4.png",
    "assets/petals/petal5.png"
];

function createPetal(){
    const petal = document.createElement("img");

    petal.classList.add("petal");
    petal.src =
        petalImages[
            Math.floor(Math.random()*petalImages.length)
        ];
    petal.style.left = Math.random()*100 + "%";
    petal.style.width =
        (18 + Math.random()*22) + "px";
    petal.style.animationDuration =
        (4 + Math.random()*3) + "s";
    petal.style.transform =
        `rotate(${Math.random()*360}deg)`;
    document
        .getElementById("petals-container")
        .appendChild(petal);
    setTimeout(()=>{
        petal.remove();
    },7000);
}

/* ======================================================
   AKTIVE NAVIGATION
   Markiert den aktuell sichtbaren Abschnitt.
====================================================== */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if(link.getAttribute("href") === "#" + current){
            link.classList.add("active");
        }
    });
});

/* ======================================================
   PARALLAX-DEKORATION
   Bewegt die Eukalyptuszweige leicht beim Scrollen.
====================================================== */
const decorations = document.querySelectorAll(".decor");

window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    decorations.forEach((leaf, index) => {
        const speed = 0.015 + index * 0.002;
        const move = scroll * speed;
        const rotation = getComputedStyle(leaf)
            .getPropertyValue("--rotation");
        leaf.style.transform =
            `translateY(${move}px) rotate(${rotation})`;
    });
});

/*
==========================================
Musiksteuerung (deaktiviert)

Aktivieren:
Kommentar entfernen.
==========================================

...

const musicButton = document.getElementById("musicToggle");

musicButton.addEventListener("click",()=>{
    showMusicButton();
    if(music.paused){
        music.play();
        musicButton.innerHTML =
        '<i data-lucide="volume-2"></i>';
        lucide.createIcons();
    }else{
        music.pause();
        musicButton.innerHTML =
        '<i data-lucide="volume-x"></i>';
    }
    lucide.createIcons();
});

lucide.createIcons();
let musicButtonTimeout;

function showMusicButton(){
    musicButton.classList.remove("idle");
    clearTimeout(musicButtonTimeout);
    musicButtonTimeout = setTimeout(()=>{
        musicButton.classList.add("idle");
    },2000);
}

window.addEventListener("scroll",showMusicButton);
window.addEventListener("click",showMusicButton);
window.addEventListener("touchstart",showMusicButton);
*/

/* ======================================================

    AydeaDesign
    Luxury Digital Invitations

    Project:
    Enise Melda & Kürşat
    Engagement Invitation Website

    Version: 1.0
    Released: August 2026

====================================================== */