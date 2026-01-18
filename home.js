//homejs
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
const filterBtn = document.querySelector(".btn_filter");

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
    brandsCont.innerHTML = `
      <div class="radio">
        <input type="radio" name="brand" value="" id="brand_all" checked>
        <label for="brand_all">All</label>
      </div>
    `;
    brands.forEach((brand) => {
      const brandId = `brand_${brand.replace(/\s+/g, "_")}`;
      brandsCont.innerHTML += `
           <div class="radio">
             <input type="radio" name="brand" value="${brand}" id="${brandId}">
             <label for="${brandId}">${brand}</label>
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
      s.classList.toggle(
        "active_star",
        Number(s.dataset.value) <= currentRating,
      );
    });

    minRatingShow.innerHTML = currentRating + ".0+";
  });
});

function resetRatings(rating = null) {
  stars.forEach((s) => {
    s.classList.remove("active_star");
  });

  currentRating = 0;
  currentFilter.rating = null;
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
    `https://api.everrest.educata.dev/shop/products/all?page_index=${page}&page_size=${pageSize}`,
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
      fetchCurrentPage();
    }
  };

  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchCurrentPage();
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
      fetchCurrentPage();
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

  let btnHTML = "";
  if (pr.stock <= 0) {
    btnHTML = `<button class="disabled"><span>SOLD OUT</span></button>`;
  } else {
    btnHTML = `<button onclick="addToCart('${pr._id}',this)"><span>ACQUIRE</span></button>`;
  }

  productsCont.innerHTML += `
            <div class="card">
            <div class="img_area">
              <img
                src="${pr.thumbnail}"
                alt=""
                onerror="this.onerror=null; this.src='backupImg.jpg';"
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
  `,
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
                ${btnHTML}
              </div>
            </div>
          </div>
    `;
}

function fetchCurrentPage() {
  if (currentMode === "all") {
    fetchProducts(currentPage);
  } else if (currentMode === "search") {
    fetchSearchPr(currentSearch);
  } else if (currentMode === "filter") {
    fetchFilterPr(currentFilter);
  }
}

//!SEARCH
let currentMode = "all";
let currentSearch = "";
let currentFilter = {
  category: null,
  brand: null,
  price: null,
  rating: null,
};

const search = document.getElementById("search");

search.addEventListener("keydown", () => {
  currentPage = 1;
  currentMode = "search";
  currentSearch = search.value.trim();
  fetchCurrentPage();
});

function fetchSearchPr(searchInp) {
  fetch(
    `https://api.everrest.educata.dev/shop/products/search?page_index=${currentPage}&page_size=${pageSize}&keywords=${searchInp}`,
  )
    .then((answ) => answ.json())
    .then((data) => {
      totalPages = Math.ceil(data.total / pageSize);
      productsCont.innerHTML = "";

      if (data.products.length == 0) {
        noRes();
      } else {
        data.products.forEach((pr) => displayProducts(pr));
      }

      document.getElementById("prod_count").textContent = data.total;

      renderPagination();
    });
}

function noRes() {
  productsCont.innerHTML = `<h1 class="show_no_res">NO NODES FOUND <i class="fa-solid fa-folder-open"></i></h1>`;
}

//!FILTER
filterBtn.addEventListener("click", () => {
  currentPage = 1;
  currentMode = "filter";

  currentFilter.category = Number(categories.value) || null;

  const selectedBrand = brandsCont.querySelector("input[name='brand']:checked");
  currentFilter.brand =
    selectedBrand && selectedBrand.value ? selectedBrand.value : null;

  currentFilter.price = Number(priceSlider.value) || null;

  currentFilter.rating = currentRating > 0 ? currentRating : null;

  fetchCurrentPage();
});

function fetchFilterPr(filter) {
  let url = `https://api.everrest.educata.dev/shop/products/search?page_index=${currentPage}&page_size=${pageSize}`;

  if (filter.category && filter.category !== 0) {
    url += `&category_id=${filter.category}`;
  }

  if (filter.brand) {
    url += `&brand=${encodeURIComponent(filter.brand)}`;
  }

  if (filter.price && filter.price > 0) {
    url += `&price_max=${filter.price}`;
  }

  if (filter.rating && filter.rating > 0) {
    url += `&rating=${filter.rating}`;
  }

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      totalPages = Math.ceil(data.total / pageSize);
      productsCont.innerHTML = "";

      if (!data.products || data.products.length === 0) {
        noRes();
      } else {
        data.products.forEach((pr) => displayProducts(pr));
      }

      document.getElementById("prod_count").textContent = data.total;
      renderPagination();
    });
}

//!cart
function addToCart(id,btn = null) {
  let userToken = Cookies.get("user");
  if (!userToken) {
    showMsg();
  } else {
    fetch("https://api.everrest.educata.dev/shop/cart", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${userToken}`
      }
    })
    .then((answ) => answ.json())
    .then((cartData) => {
      let existingProduct = cartData.products?.find(item => item.productId === id);
      let newQuantity = existingProduct ? existingProduct.quantity + 1 : 1;
      
      let prodInfo = {
        id: id,
        quantity: newQuantity,  
      };

      return fetch("https://api.everrest.educata.dev/auth", {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${userToken}`
        }
      })
      .then((answ) => answ.json())
      .then((data) => {
        return fetch("https://api.everrest.educata.dev/shop/cart/product", {
          method: data.cartID ? 'PATCH' : 'POST',
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(prodInfo)
        });
      })
      .then((answ) => answ.json())
      .then((data) => {
        showAdded(btn);
      });
    })
    .catch((error) => {
      console.error("Error adding to cart:", error);
    });
  }
}
function showMsg() {
  const msgBox = document.createElement("div");
  msgBox.className = "msg_box";
  msgBox.innerHTML = `
        <div class="msg_box_cont">
          <span class="close_auth"><i class="fa-solid fa-x"></i></span>
          <h1>AUTHENTICATE TO ACQUIRE THE ITEM</h1>
        </div>
   `;

  document.body.style.overflow = "hidden";

  document.body.appendChild(msgBox);

  document.querySelector(".close_auth").onclick = () => {
    msgBox.remove();
    document.body.style.overflow = "";
  };
}

function showAdded(btn) {
  if (!btn) return; 

  const card = btn.closest(".card");
  if (!card) return;

  const imgArea = card.querySelector(".img_area");
  if (!imgArea) return;

  if (imgArea.querySelector(".added_badge")) return;

  const msg = document.createElement("div");
  msg.className = "added_badge";
  msg.innerHTML = "Added";

  imgArea.appendChild(msg);

  setTimeout(() => {
    msg.classList.add("fade_out");
    setTimeout(() => msg.remove(), 300);
  }, 1000);
}

