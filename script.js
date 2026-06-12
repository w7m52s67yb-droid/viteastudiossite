console.log("Vitea Studios Loaded");

/* SCROLL REVEAL ANIMATION */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
});

document.querySelectorAll("section").forEach(section => {
    section.classList.add("reveal");
    observer.observe(section);
});

/* MOBILE NAV TOGGLE */
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
});

/* Close mobile menu when a link is clicked */
navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    });
});