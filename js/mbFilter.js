const filterIcon = document.querySelector(".filterIcon");
const filterArea = document.querySelector(".filter_area");
const closeFilter = document.querySelector(".fa-x");

filterIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  filterArea.classList.add("active_mb");
  filterIcon.classList.remove("visible"); 
  closeFilter.style.display = "block";
});

closeFilter.addEventListener("click", (e) => {
  e.stopPropagation();
  closeFilterPanel();
});

filterArea.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  closeFilterPanel();
});

function closeFilterPanel() {
  filterArea.classList.remove("active_mb");
  filterIcon.classList.add("visible");
  closeFilter.style.display = "none";
}
