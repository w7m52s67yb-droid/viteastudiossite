console.log("Vitea Studios Loaded");

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

/* ================================================
   SCROLL PROGRESS BAR
   ================================================ */
const progressBar = document.getElementById("scroll-progress");
window.addEventListener("scroll", () => {
    const scrollTop    = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = ((scrollTop / scrollHeight) * 100) + "%";
}, { passive: true });

/* ================================================
   COMPETITION COUNTDOWN
   ================================================ */
const eventEnd = new Date("2026-07-24T23:59:59").getTime();

function updateTimer() {
    const diff = eventEnd - Date.now();
    if (diff <= 0) {
        document.getElementById("comp-timer").innerHTML = '<div class="timer-ended">Event has ended</div>';
        return;
    }
    const pad = n => String(Math.floor(n)).padStart(2, "0");
    document.getElementById("timer-days").textContent  = pad(diff / 86400000);
    document.getElementById("timer-hours").textContent = pad((diff % 86400000) / 3600000);
    document.getElementById("timer-mins").textContent  = pad((diff % 3600000) / 60000);
    document.getElementById("timer-secs").textContent  = pad((diff % 60000) / 1000);
}
updateTimer();
setInterval(updateTimer, 1000);

/* ================================================
   3D TILT ON STAT CARDS
   ================================================ */
document.querySelectorAll(".stat-card").forEach(card => {
    card.addEventListener("mousemove", e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -6;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  6;
        card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

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
    return localStorage.getItem(REVIEWED_KEY) === "1";
}

function markReviewed() {
    localStorage.setItem(REVIEWED_KEY, "1");
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
    checkReviewedUI();
    const reviews = await loadReviews();
    renderReviews(reviews);
})();