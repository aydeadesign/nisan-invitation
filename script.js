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
   Nutzt visualViewport wenn verfügbar für sofortige Updates.
====================================================== */
function setViewportHeight() {
    // visualViewport liefert oft aktuelleres Height beim Ein-/Ausblenden der Browser-UI
    const vh = (window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty(
        "--vh",
        `${vh * 0.01}px`
    );
    // nachdem --vh neu gesetzt wurde, passe die Naht an (wenn nötig)
    adjustWelcomeOverlap();
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
// Wenn visualViewport verfügbar ist, reagiert es direkter
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setViewportHeight);
    window.visualViewport.addEventListener('scroll', () => {
        clearTimeout(vhTimeout);
        vhTimeout = setTimeout(setViewportHeight, 80);
    });
}

/* ======================================================
   HELPER: Naht zwischen .hero und .welcome dynamisch anpassen
   Wenn die Viewport-Höhe schwankt (Adressleiste), berechnen wir
   die Differenz hero.bottom -> welcome.top und ziehen die
   Welcome-Section bei Bedarf nach oben (negativer margin-top).

   Diese Logik läuft nur auf kleinen Bildschirmen / Landscape,
   ist debounced und reversibel (setzt style zurück wenn nicht
   mehr nötig).
====================================================== */
const seamDebounce = (fn, wait = 60) => {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
};

function adjustWelcomeOverlap() {
    try {
        const mq = window.matchMedia('(max-width: 1024px), (orientation: landscape)');
        if (!mq.matches) {
            // Desktop: entferne Inline-Anpassung wenn vorhanden
            const welcome = document.querySelector('.welcome');
            if (welcome && welcome.style.marginTop) welcome.style.marginTop = '';
            return;
        }

        const hero = document.querySelector('.hero');
        const welcome = document.querySelector('.welcome');
        if (!hero || !welcome) return;

        const heroRect = hero.getBoundingClientRect();
        const welcomeRect = welcome.getBoundingClientRect();

        // Gap: wie viele Pixel liegen zwischen hero.bottom und welcome.top
        const gap = Math.round(welcomeRect.top - heroRect.bottom);

        if (gap > 0) {
            // noch Abstand — ziehen wir welcome nach oben um die Lücke zu schließen
            // begrenze die Korrektur (z.B. max 200px) um ungewollte große Verschiebungen zu vermeiden
            const correction = Math.min(gap, 200);
            welcome.style.marginTop = `-${correction}px`;
        } else {
            // kein Abstand — entferne Inline-Anpassung
            if (welcome.style.marginTop) welcome.style.marginTop = '';
        }
    } catch (e) {
        // defensive
        console.error('adjustWelcomeOverlap error', e);
    }
}

const adjustWelcomeOverlapDebounced = seamDebounce(adjustWelcomeOverlap, 48);

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
                    const hint = document.querySelector(".scroll-hint");
                    hint && hint.classList.add("show");
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
    adjustWelcomeOverlapDebounced();
}, 40);

window.addEventListener("scroll", onScrollThrottled);

// initial run
revealOnScroll();
updateNavShow();
updateActiveSection();
updateParallax();
adjustWelcomeOverlap();

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

/* ======================================================
   DEBUG / DEEP ANALYSIS WIDGET
   Fügt ein sichtbares Overlay hinzu, das Viewport- und
   Element-Metriken anzeigt, um die Ursache der Haarnaht
   zwischen Hero und Welcome zu identifizieren.

   Änderungen sind diagnostisch und reversibel.
====================================================== */
(function addDebugWidget() {
    try {
        const debug = document.createElement('div');
        debug.id = 'debug-overlay';
        debug.style.position = 'fixed';
        debug.style.right = '10px';
        debug.style.top = '10px';
        debug.style.zIndex = '99999';
        debug.style.background = 'rgba(0,0,0,0.6)';
        debug.style.color = 'white';
        debug.style.fontSize = '12px';
        debug.style.lineHeight = '1.3';
        debug.style.padding = '8px 10px';
        debug.style.borderRadius = '8px';
        debug.style.maxWidth = '220px';
        debug.style.fontFamily = 'monospace';
        debug.style.pointerEvents = 'none';
        debug.innerHTML = 'debug initializing...';
        document.body.appendChild(debug);

        // enable debug outlines
        document.body.classList.add('debug-mode');

        const heroEl = document.querySelector('.hero');
        const welcomeEl = document.querySelector('.welcome');

        function updateDebug() {
            const innerH = window.innerHeight;
            const scrollY = window.scrollY || window.pageYOffset;
            const cssVh = getComputedStyle(document.documentElement).getPropertyValue('--vh') || 'unset';
            const visualH = (window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : 'n/a';
            const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;
            const welcomeRect = welcomeEl ? welcomeEl.getBoundingClientRect() : null;

            const lines = [];
            lines.push(`<strong>innerH:</strong> ${innerH}px`);
            lines.push(`<strong>visualH:</strong> ${visualH}px`);
            lines.push(`<strong>--vh:</strong> ${cssVh}`);
            lines.push(`<strong>scrollY:</strong> ${Math.round(scrollY)}px`);
            if (heroRect) {
                lines.push(`<strong>hero.h:</strong> ${Math.round(heroRect.height)}px`);
                lines.push(`<strong>hero.bottom:</strong> ${Math.round(heroRect.bottom)}px`);
            }
            if (welcomeRect) {
                lines.push(`<strong>welcome.top:</strong> ${Math.round(welcomeRect.top)}px`);
                lines.push(`<strong>welcome.h:</strong> ${Math.round(welcomeRect.height)}px`);
            }

            debug.innerHTML = lines.join('<br>');
        }

        const debouncedUpdate = (() => {
            let t;
            return () => {
                clearTimeout(t);
                t = setTimeout(updateDebug, 60);
            };
        })();

        window.addEventListener('resize', debouncedUpdate);
        window.addEventListener('orientationchange', debouncedUpdate);
        window.addEventListener('scroll', debouncedUpdate);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', debouncedUpdate);
            window.visualViewport.addEventListener('scroll', debouncedUpdate);
        }

        // initial
        updateDebug();

    } catch (err) {
        console.error('debug widget failed', err);
    }
})();
