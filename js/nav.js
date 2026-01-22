const bars = document.querySelector(".bars");
const mobileNav = document.querySelector(".nav_field");

bars.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileNav.classList.toggle("active_mb_nav");

    if (mobileNav.classList.contains("active_mb_nav")) {
        bars.innerHTML = `<i class="fa-solid fa-x"></i>`;
    } else {
        bars.innerHTML = `<i class="fa-solid fa-bars"></i>`;
    }
});

mobileNav.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.addEventListener("click", () => {
    if (mobileNav.classList.contains("active_mb_nav")) {
        mobileNav.classList.remove("active_mb_nav");
        bars.innerHTML = `<i class="fa-solid fa-bars"></i>`;
    }
});
