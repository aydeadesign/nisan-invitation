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

let vhTimeout;
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);
// Debounced update beim Scroll — hilft, wenn die Browser-UI ein-/ausblendet
window.addEventListener("scroll", () => {
    clearTimeout(vhTimeout);
    vhTimeout = setTimeout(setViewportHeight, 120);
});

/* ======================================================
   HERO
   Öffnet den Umschlag, startet die Animationen
   und blendet anschließend die Einladung ein.
====================================================== */
if (closedEnvelope) {
    closedEnvelope.addEventListener("click", () => {
        // Versuch, das Video zu starten (manche Browser blockieren Autoplay)
        bgVideo && bgVideo.play && bgVideo.play().catch(err => {
            console.log("Video konnte nicht gestartet werden:", err);
        });

        // animation
        closedEnvelope.classList.add("fade-out");
        setTimeout(() => {
            closedEnvelope.style.display = "none";
            openEnvelope.classList.remove("hidden");
            setTimeout(() => {
                openEnvelope.classList.add("show");
                /*
                document
                .getElementById("musicToggle")
                .classList.add("show");
                showMusicButton();
                */
                for (let i = 0; i < 15; i++) {
                    setTimeout(createPetal, i * 180);
                }
                setTimeout(() => {
                    document.querySelector(".scroll-hint").classList.add("show");
                }, 3000);
            }, 300);
        }, 1000);
    });

    // Accessibility: wenn das Element kein <button> ist, machen wir es tastatur-nutzbar
    if (!closedEnvelope.hasAttribute("role")) {
        closedEnvelope.setAttribute("role", "button");
    }
    if (!closedEnvelope.hasAttribute("tabindex")) {
        closedEnvelope.setAttribute("tabindex", "0");
    }
    closedEnvelope.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            closedEnvelope.click();
        }
    });
}

/* ======================================================
   COUNTDOWN
   Aktualisiert die verbleibende Zeit bis zum
   Verlobungstag im Sekundentakt.
   Robuster: ISO-Datum, Interval-Handle und PadStart
====================================================== */
const weddingDate = new Date("2026-08-30T16:00:00").getTime();
let countdownInterval = null;

function updateCountdown() {
    const now = Date.now();
    const distance = weddingDate - now;

    if (distance <= 0) {
        document.getElementById("days").textContent = "0";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days);
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
countdownInterval = setInterval(updateCountdown, 1000);

/* ======================================================
   SCROLL-ANIMATIONEN, NAV, PARALLAX
   Konsolidierte und gethrottelte Scroll-Handler,
   reduziert Repaints und verhindert Layout-Jitter.
====================================================== */
const reveals = document.querySelectorAll(".reveal");
const nav = document.querySelector(".floating-nav");
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
const decorations = document.querySelectorAll(".decor");

function revealOnScroll() {
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const visiblePoint = 120;

        if (elementTop < windowHeight - visiblePoint) {
            reveals[i].classList.add("active");
        }
    }
}

function updateActiveSection() {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
            link.setAttribute("aria-current", "true");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function updateNavShow() {
    if (window.scrollY > window.innerHeight * 0.6) {
        nav && nav.classList.add("show");
    } else {
        nav && nav.classList.remove("show");
    }
}

function updateParallax() {
    const scroll = window.scrollY;
    decorations.forEach((leaf, index) => {
        const speed = 0.015 + index * 0.002;
        const move = scroll * speed;
        const rotation = getComputedStyle(leaf).getPropertyValue("--rotation");
        leaf.style.transform = `translateY(${move}px) rotate(${rotation})`;
    });
}

function throttle(fn, wait = 40) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last >= wait) {
            last = now;
            fn.apply(this, args);
        }
    };
}

const onScrollThrottled = throttle(() => {
    revealOnScroll();
    updateNavShow();
    updateActiveSection();
    updateParallax();
}, 40);

window.addEventListener("scroll", onScrollThrottled);

// initial run
revealOnScroll();
updateNavShow();
updateActiveSection();
updateParallax();

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

function createPetal() {
    const petal = document.createElement("img");

    petal.classList.add("petal");
    petal.src = petalImages[
        Math.floor(Math.random() * petalImages.length)
    ];
    petal.style.left = Math.random() * 100 + "%";
    petal.style.width = (18 + Math.random() * 22) + "px";
    petal.style.animationDuration = (4 + Math.random() * 3) + "s";
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;
    document
        .getElementById("petals-container")
        .appendChild(petal);
    setTimeout(() => {
        petal.remove();
    }, 7000);
}

/* ======================================================
   PARALLAX-DEKORATION (wird jetzt durch onScrollThrottled aufgerufen)
====================================================== */

/* ======================================================
   AKTIVE NAVIGATION
   (Funktionalität integriert in onScrollThrottled)
====================================================== */

/* ======================================================

    AydeaDesign
    Luxury Digital Invitations

    Project:
    Enise Melda & Kürşat
    Engagement Invitation Website

    Version: 1.0
    Released: August 2026

====================================================== */
