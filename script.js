/* ================================================
   SCROLL REVEAL
   ================================================ */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll("section").forEach(s => {
    s.classList.add("reveal");
    observer.observe(s);
});

/* ================================================
   MOBILE NAV
   ================================================ */
const navToggle = document.getElementById("nav-toggle");
const navLinks  = document.getElementById("nav-links");

if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        navToggle.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen);
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            navToggle.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

/* ================================================
   CARD / TILE SPOTLIGHT
   ================================================ */
document.querySelectorAll(".card, .tile").forEach(el => {
    el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
});

/* ================================================
   COPY EMAIL
   ================================================ */
const copyBtn    = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");

if (copyBtn) {
    const copyLabel = copyBtn.querySelector(".copy-label");
    let copyTimer;

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        // Fallback for non-secure contexts / older browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity  = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("Copy failed");
    }

    copyBtn.addEventListener("click", async () => {
        clearTimeout(copyTimer);
        try {
            await copyText(copyBtn.dataset.email);
            copyBtn.classList.add("copied");
            copyLabel.textContent = "Copied!";
            if (copyStatus) copyStatus.textContent = "Email address copied to clipboard";
        } catch {
            copyLabel.textContent = "Press Ctrl+C";
            if (copyStatus) copyStatus.textContent = "Could not copy automatically";
        }
        copyTimer = setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyLabel.textContent = "Copy";
            if (copyStatus) copyStatus.textContent = "";
        }, 2000);
    });
}

/* ================================================
   NAV STATE + HERO VIDEO
   ================================================ */
const siteNav = document.getElementById("site-nav");

function onScroll() {
    // Home page: nav is transparent over the video until the page scrolls
    if (siteNav) siteNav.classList.toggle("scrolled", window.scrollY > 24);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const heroVideo = document.getElementById("hero-video");

if (heroVideo) {
    const hero     = heroVideo.closest("header") || heroVideo;
    const soundBtn = document.getElementById("sound-toggle");
    const reduced  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    heroVideo.muted = true; // required for autoplay in all browsers

    const safePlay = () => {
        const p = heroVideo.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
    };

    function syncSound() {
        if (!soundBtn) return;
        soundBtn.classList.toggle("is-off", heroVideo.muted);
        soundBtn.setAttribute("aria-label", heroVideo.muted ? "Turn video sound on" : "Turn video sound off");
    }

    if (reduced) {
        // Reduced motion: show the still poster, no playback, no sound button
        heroVideo.removeAttribute("autoplay");
        heroVideo.preload = "none";
        heroVideo.pause();
        heroVideo.load();
        if (soundBtn) soundBtn.hidden = true;
    } else {
        if (soundBtn) {
            soundBtn.addEventListener("click", () => {
                heroVideo.muted = !heroVideo.muted;
                if (heroVideo.paused) safePlay();
                syncSound();
            });
        }

        // Pause (and silence) the video whenever the hero is scrolled out of view
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) safePlay();
                else                      heroVideo.pause();
            }, { threshold: 0.05 }).observe(hero);
        }
    }

    syncSound();
}

/* ================================================
   COMPETITION COUNTDOWN
   ================================================ */
const eventEnd  = new Date("2026-07-24T23:59:59").getTime();
const compTimer = document.getElementById("comp-timer");

function updateTimer() {
    if (!compTimer) return; // timer markup not present on this page (e.g. reviews.html)

    const diff = eventEnd - Date.now();
    if (diff <= 0) {
        compTimer.innerHTML = '<div class="timer-ended">Event has ended</div>';
        return;
    }
    const pad = n => String(Math.floor(n)).padStart(2, "0");
    document.getElementById("timer-days").textContent  = pad(diff / 86400000);
    document.getElementById("timer-hours").textContent = pad((diff % 86400000) / 3600000);
    document.getElementById("timer-mins").textContent  = pad((diff % 3600000) / 60000);
    document.getElementById("timer-secs").textContent  = pad((diff % 60000) / 1000);
}
if (compTimer) {
    updateTimer();
    setInterval(updateTimer, 1000);
}

/* ================================================
   COOKIE CONSENT
   ================================================ */
const CONSENT_KEY = "vs_cookie_consent";   // "accepted" | "declined"

function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}

function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* storage blocked */ }
}

// Other scripts (e.g. future analytics) can check: window.vsConsent.status() === "accepted"
window.vsConsent = { status: () => getConsent() || "unset" };

(function initConsent() {
    let banner = null;

    function build() {
        banner = document.createElement("div");
        banner.className = "consent";
        banner.id = "cookie-consent";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-label", "Cookie preferences");
        banner.hidden = true;
        banner.innerHTML = `
            <span class="consent-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>
            </span>
            <div class="consent-body">
                <p class="consent-title">Cookies &amp; storage</p>
                <p class="consent-text">We only use a small piece of browser storage to make the site work, like remembering that you've left a review. No ads and no tracking. <a href="/privacy#cookies">Learn more</a></p>
            </div>
            <div class="consent-actions">
                <button type="button" class="consent-btn consent-btn--ghost" data-consent="declined">Decline</button>
                <button type="button" class="consent-btn" data-consent="accepted">Accept</button>
            </div>`;
        document.body.appendChild(banner);

        banner.querySelectorAll("[data-consent]").forEach(btn => {
            btn.addEventListener("click", () => {
                const choice = btn.dataset.consent;
                setConsent(choice);
                if (choice === "declined") {
                    // Declining clears the optional review flag
                    try { localStorage.removeItem("vs_reviewed"); } catch { /* ignore */ }
                }
                document.dispatchEvent(new CustomEvent("vs:consent", { detail: choice }));
                hide();
            });
        });
    }

    function show(focusButton) {
        if (!banner) build();
        banner.hidden = false;
        banner.classList.remove("is-leaving");
        // restart the entrance animation when re-opened
        banner.style.animation = "none";
        void banner.offsetWidth;
        banner.style.animation = "";
        if (focusButton) banner.querySelector('[data-consent="accepted"]').focus();
    }

    function hide() {
        if (!banner) return;
        banner.classList.add("is-leaving");
        setTimeout(() => {
            banner.hidden = true;
            banner.classList.remove("is-leaving");
        }, 260);
    }

    // First visit: show after a short pause
    if (!getConsent()) setTimeout(() => show(false), 700);

    // Footer "Cookie settings" link re-opens the popup
    document.querySelectorAll("[data-consent-open]").forEach(el => {
        el.addEventListener("click", () => show(true));
    });
})();

/* ================================================
   REVIEWS — Firebase Realtime Database
   ================================================ */
const DB_URL    = "https://vswebsitestore-default-rtdb.firebaseio.com";
const REVIEWED_KEY = "vs_reviewed";   // localStorage flag

/* --- Profanity filter (basic) --- */
const BAD_WORDS = [
    "fuck","shit","ass","bitch","cunt","dick","cock","pussy","bastard",
    "damn","crap","piss","slut","whore","nigger","nigga","faggot","fag",
    "retard","idiot","moron","stupid","dumb","hate","kill","die","rape"
];

function containsProfanity(text) {
    const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    return BAD_WORDS.some(w => {
        const re = new RegExp(`\\b${w}\\b`, "i");
        return re.test(lower);
    });
}

/* --- Check if user already reviewed --- */
function hasReviewed() {
    try { return localStorage.getItem(REVIEWED_KEY) === "1"; } catch { return false; }
}

function markReviewed() {
    // Only remember the review on this device if cookies/storage weren't declined
    if (getConsent() === "declined") return;
    try { localStorage.setItem(REVIEWED_KEY, "1"); } catch { /* storage blocked */ }
}

/* --- UI: hide form if already reviewed --- */
function checkReviewedUI() {
    if (hasReviewed()) {
        const form = document.querySelector(".review-form-card");
        if (form) {
            form.innerHTML = `
                <div class="rf-already">
                    <span>✓</span>
                    <p>You've already left a review. Thanks for your feedback!</p>
                </div>`;
        }
    }
}

/* --- Star picker --- */
let selectedStars = 0;
const starSpans = document.querySelectorAll("#rf-stars span");

starSpans.forEach(span => {
    span.addEventListener("mouseenter", () => highlightStars(+span.dataset.v, "hover"));
    span.addEventListener("mouseleave", () => highlightStars(selectedStars, "active"));
    span.addEventListener("click",      () => { selectedStars = +span.dataset.v; highlightStars(selectedStars, "active"); });
});

function highlightStars(val, cls) {
    starSpans.forEach(s => {
        s.classList.remove("active","hover");
        if (+s.dataset.v <= val) s.classList.add(cls);
    });
}

/* --- Char counter --- */
const rfText  = document.getElementById("rf-text");
const rfChars = document.getElementById("rf-chars");
if (rfText) rfText.addEventListener("input", () => { rfChars.textContent = rfText.value.length + " / 300"; });

/* --- Escape HTML --- */
function esc(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* --- Shake --- */
function shake(el) {
    el.style.outline  = "1.5px solid #ff4444";
    el.style.animation = "shake .3s ease";
    setTimeout(() => { el.style.outline = ""; el.style.animation = ""; }, 800);
}

/* --- Fetch reviews from Firebase --- */
async function loadReviews() {
    try {
        const res  = await fetch(`${DB_URL}/reviews.json`);
        const data = await res.json();
        if (!data) return [];
        return Object.values(data).sort((a,b) => b.ts - a.ts);
    } catch { return []; }
}

/* --- Save review to Firebase --- */
async function saveReview(review) {
    const res = await fetch(`${DB_URL}/reviews.json`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(review)
    });
    if (!res.ok) throw new Error("Save failed");
}

/* --- Build a review card element --- */
function makeCard(r) {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
        <div class="review-header">
            <span class="review-name">${esc(r.name)}</span>
            <span class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span>
        </div>
        <p class="review-text">${esc(r.text)}</p>
        <span class="review-date">${r.date}</span>`;
    return card;
}

/* --- Render rating summary --- */
function renderSummary(reviews) {
    const summary = document.getElementById("rating-summary");
    if (!reviews.length) { if (summary) summary.style.display = "none"; return; }

    summary.style.display = "flex";

    const avg   = reviews.reduce((a,r) => a + r.stars, 0) / reviews.length;
    const total = reviews.length;

    document.getElementById("rating-avg").textContent       = avg.toFixed(1);
    document.getElementById("rating-stars-big").textContent = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
    document.getElementById("rating-count").textContent     = total + (total === 1 ? " review" : " reviews");
}

/* --- Render diagonal horizontal marquee --- */
function renderReviews(reviews) {
    const wrap       = document.getElementById("reviews-marquee-wrap");
    const track      = document.getElementById("reviews-track");
    const emptyState = document.getElementById("reviews-empty-state");

    renderSummary(reviews);

    if (!reviews.length) {
        if (wrap)       wrap.style.display       = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (wrap)       wrap.style.display       = "block";
    if (emptyState) emptyState.style.display = "none";

    track.innerHTML = "";

    // Duplicate until we have enough cards to fill the track seamlessly
    let pool = [...reviews];
    while (pool.length < 12) pool = [...pool, ...reviews];

    // Build two sets for seamless loop
    [...pool, ...pool].forEach(r => track.appendChild(makeCard(r)));
}

/* --- Submit --- */
const submitBtn = document.getElementById("rf-submit");
if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
        const name = document.getElementById("rf-name").value.trim();
        const text = rfText.value.trim();

        if (!name)            return shake(document.getElementById("rf-name"));
        if (!selectedStars)   return shake(document.getElementById("rf-stars"));
        if (text.length < 5)  return shake(rfText);

        if (containsProfanity(name) || containsProfanity(text)) {
            const notice = document.querySelector(".rf-notice");
            notice.textContent = "⚠️ Your review contains inappropriate language. Please revise it.";
            notice.style.color = "#ff4444";
            setTimeout(() => { notice.textContent = "Reviews are public and visible to everyone."; notice.style.color = ""; }, 3000);
            return;
        }

        submitBtn.textContent = "Posting...";
        submitBtn.disabled    = true;

        try {
            await saveReview({
                name,
                stars: selectedStars,
                text,
                date: new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }),
                ts:   Date.now()
            });

            markReviewed();
            checkReviewedUI();

            const reviews = await loadReviews();
            renderReviews(reviews);

        } catch {
            submitBtn.textContent = "Post Review";
            submitBtn.disabled    = false;
            const notice = document.querySelector(".rf-notice");
            if (notice) { notice.textContent = "⚠️ Failed to post. Try again."; notice.style.color = "#ff4444"; }
        }
    });
}

/* --- Init --- */
(async () => {
    // Only pages that show or accept reviews should talk to the database
    if (!document.getElementById("reviews-track") && !document.querySelector(".review-form-card")) return;

    checkReviewedUI();
    const reviews = await loadReviews();
    renderReviews(reviews);
})();