const addToCartBtn = document.querySelector(".btn_add_to_cart");
const prId = sessionStorage.getItem("prId");
const search = document.getElementById("search");
const ratingBtn = document.querySelector(".btn_submit_rating");

disableElem(search);

//!display images
const bigImg = document.getElementById("big_img");
const smallImgsCont = document.querySelector(".thumbnail_images");

function displayImages(imgs, bigImgSrc) {
  bigImg.src = bigImgSrc;
  bigImg.onerror = function () {
    this.onerror = null;
    this.src = "/other/backupImg.jpg";
  };
  imgs.forEach((img, index) => {
    smallImgsCont.innerHTML += `
         <div class="thumbnail ${index === 0 ? "active" : ""}" onclick="activate('${img}', this)">
              <img src="${img}" onerror="this.onerror=null; this.src='/other/backupImg.jpg';" />
         </div>
    `;
  });
}

function activate(imgsrc, element) {
  bigImg.src = imgsrc;
  bigImg.onerror = function () {
    this.onerror = null;
    this.src = "/other/backupImg.jpg";
  };

  const allImgs = document.querySelectorAll(".thumbnail");
  allImgs.forEach((thumb) => thumb.classList.remove("active"));

  element.classList.add("active");
}

//!display Info on page

const brandBadge = document.querySelector(".brand_badge");
const productTitle = document.querySelector(".product_title");
const currentPrice = document.querySelector(".price");
const priceCont = document.querySelector(".price_cont");
const reliseDate = document.querySelector(".realise_date");
const Stock = document.querySelector(".stock");

function displayInfo(pr) {
  brandBadge.textContent = pr.brand;
  productTitle.textContent = pr.title;

  currentPrice.textContent = "$" + pr.price.current;
  if (pr.price.discountPercentage > 0) {
    priceCont.innerHTML += ` <span class="pr_bef_disc">$${pr.price.beforeDiscount}</span>`;
  }

  const formattedDate = new Date(pr.issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  reliseDate.textContent = formattedDate;

  Stock.textContent = `${pr.stock} IN STOCK`;
}

//!fetch for getting the product (main fetch i call it)
fetch(`https://api.everrest.educata.dev/shop/products/id/${prId}`)
  .then((answ) => answ.json())
  .then((pr) => {
    if (pr.stock == 0) {
      disableElem(addToCartBtn);
    }

    displayImages(pr.images, pr.thumbnail);

    displayInfo(pr);

    displayDetails(pr.description, pr.warranty);

    displayratings(pr.ratings);

    let savedUserId = Cookies.get("userId");
    if (savedUserId && hasUserRated(pr.ratings, savedUserId)) {
      disableElem(ratingBtn);
      ratingBtn.textContent = "ALREADY RATED";
    }
  });

//!add to cart
addToCartBtn.addEventListener("click", () => {
  addToCart();
});

function addToCart() {
  let userToken = Cookies.get("user");
  if (!userToken) {
    showActionMessage("PLEASE LOG IN TO ADD ITEMS TO CART");
  } else {
    fetch("https://api.everrest.educata.dev/shop/cart", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((answ) => {
        if (!answ.ok) {
          return { products: [] };
        }
        return answ.json();
      })
      .then((cartData) => {
        let existingProduct = cartData.products?.find(
          (item) => item.productId === prId,
        );
        let newQuantity = existingProduct ? existingProduct.quantity + 1 : 1;

        let prodInfo = {
          id: prId,
          quantity: newQuantity,
        };

        return fetch("https://api.everrest.educata.dev/shop/cart/product", {
          method: existingProduct ? "PATCH" : "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prodInfo),
        });
      })
      .then((answ) => answ.json())
      .then((data) => {
        showActionMessage("ITEM ADDED SUCCESSFULLY", "adding");
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  }
}

//!rating
const ratingModal = document.getElementById("rating_modal");

ratingBtn.addEventListener("click", () => {
  let userToken = Cookies.get("user");
  if (!userToken) {
    showActionMessage("PLEASE LOG IN TO SUBMIT A rating");
  } else {
    ratingModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    showratingForm();
  }
});

function showratingForm() {
  let selectedRating = 0;
  const ratingStars = ratingModal.querySelectorAll(".rating_star");
  const okBtn = ratingModal.querySelector(".ok_btn");
  const closeBtn = ratingModal.querySelector(".close_rating");

  ratingStars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      ratingStars.forEach((s) => {
        s.classList.toggle(
          "active_rating_star",
          Number(s.dataset.value) <= selectedRating,
        );
      });
    });
  });

  closeBtn.onclick = () => {
    ratingModal.style.display = "none";
    document.body.style.overflow = "";
    resetratingForm();
  };

  okBtn.onclick = () => {
    if (selectedRating === 0) {
      showratingMsg("PLEASE SELECT A RATING");
      return;
    }

    doRating(selectedRating);
    if (doRating) {
      showratingMsg("rating POSTED", "rating");
    }

   setTimeout(() => {
    ratingModal.style.display = "none";
    document.body.style.overflow = "";
    resetratingForm();
    fetch(`https://api.everrest.educata.dev/shop/products/id/${prId}`)
      .then((answ) => answ.json())
      .then((pr) => {
        displayratings(pr.ratings);
        
        // Update the rating button if needed
        let savedUserId = Cookies.get("userId");
        if (savedUserId && hasUserRated(pr.ratings, savedUserId)) {
          disableElem(ratingBtn);
          ratingBtn.textContent = "ALREADY RATED";
        }
      });
  }, 2000);
  };
}

function resetratingForm() {
  const ratingStars = ratingModal.querySelectorAll(".rating_star");
  ratingStars.forEach((s) => {
    s.classList.remove("active_rating_star");
  });
}

function doRating(rating) {  
  fetch("https://api.everrest.educata.dev/shop/products/rate", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
    body: JSON.stringify({
      productId: prId,
      rate: rating,
    }),
  })
    .then((answ) => answ.json())
    .then((data) => {
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
}

//!lets call them helper functions
function disableElem(elem) {
  elem.disabled = true;
  elem.style.opacity = "0.5";
  elem.style.pointerEvents = "none";
}

function hasUserRated(ratings, userId) {
  return ratings.some(rating => rating.userId === userId);
}

//!msg
const actionMsg = document.querySelector(".action_msg");

function showActionMessage(text, action = null) {
  actionMsg.textContent = text;
  actionMsg.classList.add("show");

  if (action == "adding") {
    actionMsg.style.color = "#22d3ee";
  }

  clearTimeout(actionMsg._timeout);
  actionMsg._timeout = setTimeout(() => {
    actionMsg.classList.remove("show");
  }, 1000);
}

const ratingMsg = document.querySelector(".rating_msg");

function showratingMsg(text, type = null) {
  ratingMsg.textContent = text;
  ratingMsg.classList.add("show");
  if (type == "rating") {
    ratingMsg.style.color = "#22d3ee";
  }

  clearTimeout(ratingMsg._timeout);
  ratingMsg._timeout = setTimeout(() => {
    ratingMsg.classList.remove("show");
    ratingMsg.style.display = "none";
  }, 2000);
}

//!tabs area
const tabBtns = document.querySelectorAll(".tabBtn");
const tabContents = document.querySelectorAll(".tab_content");
const descriptionCont = document.querySelector(".description");
const warrantyCont = document.querySelector(".warranty");
const ratingsList = document.querySelector(".ratings_list");
const ratingsLength = document.getElementById("ratings_length");

function displayDetails(description, warranty) {
  descriptionCont.textContent = description.toUpperCase();
  warrantyCont.textContent = warranty + " YEARS";
}

let currentRatingsDisplayed = 0;
const ratingsPerPage = 6;
let allRatings = [];

function displayratings(ratings) {
  allRatings = ratings;
  currentRatingsDisplayed = 0;

  const ratingsTab = document.querySelector("#ratings_tab");

  if (ratings.length == 0) {
    ratingsList.innerHTML = `<p class="no_ratings">NO RATINGS YET</p>`;
  } else {
    ratingsList.innerHTML = "";
    ratingsLength.textContent = ratings.length;

    let loadMoreContainer = ratingsTab.querySelector(".load_more_container");
    if (!loadMoreContainer) {
      loadMoreContainer = document.createElement("div");
      loadMoreContainer.className = "load_more_container";
      loadMoreContainer.innerHTML = `
        <button class="btn_load_more">
          <i class="fa-solid fa-chevron-down"></i> LOAD MORE
        </button>
        <button class="btn_hide_ratings">
          <i class="fa-solid fa-chevron-up"></i> HIDE
        </button>
      `;
      ratingsTab.appendChild(loadMoreContainer);

      loadMoreContainer
        .querySelector(".btn_load_more")
        .addEventListener("click", loadMoreRatings);
      loadMoreContainer
        .querySelector(".btn_hide_ratings")
        .addEventListener("click", hideRatings);
    }

    loadMoreRatings();
  }
}

function loadMoreRatings() {
  const loadMoreBtn = document.querySelector(".btn_load_more");
  const hideBtn = document.querySelector(".btn_hide_ratings");

  const endIndex = Math.min(
    currentRatingsDisplayed + ratingsPerPage,
    allRatings.length,
  );

  for (let i = currentRatingsDisplayed; i < endIndex; i++) {
    const rating = allRatings[i];

    const date = new Date(rating.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    let stars = "";
    for (let j = 1; j <= 5; j++) {
      if (j <= rating.value) {
        stars += `<i class="fa-solid fa-star"></i>`;
      } else {
        stars += `<i class="fa-solid fa-star empty_star"></i>`;
      }
    }

    const ratingItem = document.createElement("div");
    ratingItem.className = "rating_item";
    ratingItem.innerHTML = `
      <div class="rating_user_info">
        <div class="rating_username">${rating.userId}</div>
        <div class="rating_date">${formattedDate}</div>
      </div>
      <div class="rating_score">
        ${stars}
      </div>
    `;

    ratingsList.appendChild(ratingItem);

    const token = Cookies.get("user");

    fetch(`https://api.everrest.educata.dev/auth/id/${rating.userId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((answ) => {
        if (!answ.ok) {
          return { error: true, products: [] };
        }
        return answ.json();
      })
      .then((data) => {
        if (data.error) {
          const usernameEl = ratingItem.querySelector(".rating_username");
          usernameEl.textContent = "UNKNOWN USER";
          console.log("NO SUCH USER");
          
        } else {
          const usernameEl = ratingItem.querySelector(".rating_username");
          usernameEl.textContent =
            `${data.firstName} ${data.lastName}`.toUpperCase();
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }

  currentRatingsDisplayed = endIndex;

  if (currentRatingsDisplayed > ratingsPerPage) {
    hideBtn.style.display = "flex";
  }

  if (currentRatingsDisplayed >= allRatings.length) {
    loadMoreBtn.style.display = "none";
  }
}

function hideRatings() {
  const ratingsList = document.querySelector(".ratings_list");
  const loadMoreBtn = document.querySelector(".btn_load_more");
  const hideBtn = document.querySelector(".btn_hide_ratings");

  ratingsList.innerHTML = "";

  currentRatingsDisplayed = 0;

  loadMoreRatings();

  hideBtn.style.display = "none";

  if (allRatings.length > ratingsPerPage) {
    loadMoreBtn.style.display = "flex";
  }
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    const tabId = btn.id + "_tab";
    document.getElementById(tabId).classList.add("active");
  });
});
