console.log("Vitea Studios Loaded");

/* SCROLL REVEAL ANIMATION */
const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add("active");
        }
    });
});

document.querySelectorAll("section").forEach(section=>{
    section.classList.add("reveal");
    observer.observe(section);
});