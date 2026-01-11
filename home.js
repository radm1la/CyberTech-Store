const categories = document.getElementById("categories");
const brandsCont = document.getElementById("brands");
const priceCap = document.getElementById("price_cap");
const priceSlider = document.querySelector(".slider");
const stars = document.querySelectorAll(".star");
const allBtn = document.querySelector(".all_btn");
const minRatingShow = document.getElementById("min_rat");
const productsCont = document.querySelector(".products_cont");
const itemRatingStars = document.querySelectorAll(".item_star");

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


//!PRODUCTS
fetch("https://api.everrest.educata.dev/shop/products/all")
.then((answ) => answ.json())
.then((data)=>{
    console.log(data.products);
    
    
    data.products.forEach((pr)=>{
        displayProducts(pr);
    })
})


function displayProducts(pr){
    productsCont.innerHTML += `
        <div class="card">
            <img src="" alt="">
            <h3>title</h3>
            <div class="item_rating">
              <span class="item_star" data-value="1"><i class="fa-solid fa-star"></i></span>
              <span class="item_star"  data-value="2"><i class="fa-solid fa-star"></i></span>
              <span class="item_star"data-value="3"><i class="fa-solid fa-star"></i></span>
              <span class="item_star" data-value="4"><i class="fa-solid fa-star"></i></span>
              <span class="item_star" data-value="5"><i class="fa-solid fa-star"></i></span>
              <span class="rating">()</span>
            </div>
           <div class="field">
             <div class="item_price">
              <p>price</p>
              <span id="price">$444</span>
             </div>
            <button>AQCUIRE</button>
           </div>
          </div>
    `
}

