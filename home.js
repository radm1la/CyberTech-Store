const categories = document.getElementById("categories");
const brandsCont = document.getElementById("brands");
const priceCap = document.getElementById("price_cap");
const priceSlider = document.querySelector(".slider");
const stars = document.querySelectorAll(".star");
const allBtn = document.querySelector(".all_btn");
const minRatingShow = document.getElementById("min_rat");
const productsCont = document.querySelector(".products_cont");
const itemRatingStars = document.querySelectorAll(".item_star");
const discounts = document.querySelectorAll(".discount");
const prevBtn = document.getElementById("prevBtn");
const pagesCont = document.querySelector(".pages");
const nextBtn = document.getElementById("nextBtn");

//!CATEGORIES
fetch("https://api.everrest.educata.dev/shop/products/categories")
  .then((answ) => answ.json())
  .then((cats) => {
    cats.forEach((cat) => {
      showCategorie(cat);
    });
  });

function showCategorie(cat) {
  categories.innerHTML += `
        <option value="${cat.id}">${cat.name}</option>
    `;
}

//!BRANDS
fetch("https://api.everrest.educata.dev/shop/products/brands")
  .then((answ) => answ.json())
  .then((brands) => {
    brands.forEach((brand) => {
      brandsCont.innerHTML += `
           <div class="radio">
             <input type="radio" name="brand" value="${brand}">
             <label for="${brand}">${brand}</label>
           </div>
        `;
    });
  });

//!PRICE
priceCap.innerHTML = priceSlider.value;
priceSlider.addEventListener("input", () => {
  priceCap.innerHTML = priceSlider.value;
});

//!RATINGS
let currentRating = 0;

stars.forEach((star) => {
  star.addEventListener("click", () => {
    currentRating = Number(star.dataset.value);

    stars.forEach((s) => {
      if (Number(s.dataset.value) <= currentRating) {
        s.classList.add("active_star");
      } else {
        s.classList.remove("active_star");
      }
    });

    minRatingShow.innerHTML = currentRating + ".0+";
  });
});

function resetRatings(rating = null) {
  stars.forEach((s) => {
    s.classList.remove("active_star");
  });

  currentRating = 0;
  minRatingShow.innerHTML = currentRating + ".0+";
}

allBtn.addEventListener("click", resetRatings);

//!PRODUCTS & PAGINATION 
let currentPage = 1;
const pageSize = 6;
let totalPages = 1;
const maxVisiblePages = 3;


function fetchProducts(page) {
  fetch(
    `https://api.everrest.educata.dev/shop/products/all?page_index=${page}&page_size=${pageSize}`
  )
    .then((res) => res.json())
    .then((data) => {
      totalPages = Math.ceil(data.total / pageSize);
      productsCont.innerHTML = "";

      data.products.forEach((pr) => displayProducts(pr));

      document.getElementById("prod_count").textContent = data.total;

      renderPagination();
    });
}

function renderPagination() {
  pagesCont.innerHTML = "";

  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchProducts(currentPage);
    }
  };

  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchProducts(currentPage);
    }
  };

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  startPage = Math.max(1, endPage - maxVisiblePages + 1);

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active_page");
    btn.onclick = () => {
      currentPage = i;
      fetchProducts(currentPage);
    };
    pagesCont.appendChild(btn);
  }
}

fetchProducts(currentPage);

function displayProducts(pr) {
  let discountP = Number(pr.price.discountPercentage) > 0;

  const discountHTML = discountP
    ? `<div class="discount">${pr.price.discountPercentage}%</div>`
    : "";

  const beforePriceHTML =
    discountP > 0
      ? `<span class="beforeDisc">$${pr.price.beforeDiscount}</span>`
      : "";

  productsCont.innerHTML += `
            <div class="card">
            <div class="img_area">
              <img
                src="${pr.thumbnail}"
                alt=""
                onerror="this.onerror=null; this.src='https://imgstore.alta.ge/images/400/141/141727_8819_1.webp';"
              />
              <div class="brand_name">${pr.brand}</div>
              ${discountHTML}
            </div>
            <div class="text_area">
              <h3>${pr.title}</h3>
              <div class="item_rating">
                 ${[1, 2, 3, 4, 5]
                   .map(
                     (i) => `
    <i class="fa-solid fa-star ${
      i <= Math.floor(pr.rating) ? "colored" : ""
    }"></i>
  `
                   )
                   .join("")}
  <span class="rating">(${pr.rating.toFixed(1)})</span>
              </div>
              <div class="field">
                <div class="item_price">
                  <p>price</p>
                  ${beforePriceHTML}
                  <span id="price">$${pr.price.current}</span>
                </div>
                <button><span>AQCUIRE</span></button>
              </div>
            </div>
          </div>
    `;
}



