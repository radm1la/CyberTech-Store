const addToCartBtn = document.querySelector(".btn_add_to_cart");
const prId = sessionStorage.getItem("prId");
const search = document.getElementById("search");
const reviewBtn = document.querySelector(".btn_submit_review");

disableElem(search);

//!display images
const bigImg = document.getElementById("big_img");
const smallImgsCont = document.querySelector(".thumbnail_images");

function displayImages(imgs, bigImgSrc) {
  bigImg.src = bigImgSrc;
  bigImg.onerror = function () {
    this.onerror = null;
    this.src = "backupImg.jpg";
  };
  imgs.forEach((img, index) => {
    smallImgsCont.innerHTML += `
         <div class="thumbnail ${index === 0 ? "active" : ""}" onclick="activate('${img}', this)">
              <img src="${img}" onerror="this.onerror=null; this.src='backupImg.jpg';" />
         </div>
    `;
  });
}

function activate(imgsrc, element) {
  bigImg.src = imgsrc;
  bigImg.onerror = function () {
    this.onerror = null;
    this.src = "backupImg.jpg";
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

fetch(`https://api.everrest.educata.dev/shop/products/id/${prId}`)
  .then((answ) => answ.json())
  .then((pr) => {
    console.log("in product display: ",pr);

    if (pr.stock == 0) {
      disableElem(addToCartBtn);
    }

    displayImages(pr.images, pr.thumbnail);

    displayInfo(pr);
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
        showActionMessage("ITEM ADDED SUCCESSFULLY","adding");
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  }
}

//!review
const reviewModal = document.getElementById("review_modal");

reviewBtn.addEventListener("click", () => {
  let userToken = Cookies.get("user");
  if (!userToken) {
    showActionMessage("PLEASE LOG IN TO SUBMIT A REVIEW");
  } else {
    reviewModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    showReviewForm();
  }
});

function showReviewForm() {
  let selectedRating = 0;
  const reviewStars = reviewModal.querySelectorAll(".review_star");
  const okBtn = reviewModal.querySelector(".ok_btn");
  const closeBtn = reviewModal.querySelector(".close_review");

  reviewStars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      reviewStars.forEach(s => {
        s.classList.toggle("active_review_star", Number(s.dataset.value) <= selectedRating);
      });
    });
  });

  closeBtn.onclick = () => {
    reviewModal.style.display = "none";
    document.body.style.overflow = "";
    resetReviewForm();
  };


  okBtn.onclick = () => {
    if (selectedRating === 0) {
      showReviewMsg("PLEASE SELECT A RATING");
      return;
    }

    doCheckout(selectedRating);
    if(doCheckout){
      showReviewMsg("REVIEW POSTED","review")
    }
    
    setTimeout(() => {
    reviewModal.style.display = "none";
    document.body.style.overflow = "";
    resetReviewForm();
  }, 2000);
  };
}

function resetReviewForm() {
  const reviewStars = reviewModal.querySelectorAll(".review_star");
  reviewStars.forEach(s => {
    s.classList.remove("active_review_star");
  });
}

function doCheckout(rating){
  fetch("https://api.everrest.educata.dev/shop/products/rate",{
    method:"POST",
    headers:{
      accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("user")}`
    },
     body: JSON.stringify({
      productId: prId,
      rate: rating
     })
  })
  .then((answ)=>answ.json())
  .then((data)=>{
    return true;
  })
  .catch(err=> {console.log("Error: ",err);
  })
}


//!lets call them helper functions
function disableElem(elem) {
  elem.disabled = true;
  elem.style.opacity = "0.5";
  elem.style.pointerEvents = "none";
}

//!msg
const actionMsg = document.querySelector(".action_msg");

function showActionMessage(text,action = null) {
  actionMsg.textContent = text;
  actionMsg.classList.add("show");

  if(action == "adding"){
    actionMsg.style.color = "#22d3ee";
  }

  clearTimeout(actionMsg._timeout);
  actionMsg._timeout = setTimeout(() => {
    actionMsg.classList.remove("show");
  }, 1000);
}

const reviewMsg = document.querySelector(".review_msg");

function showReviewMsg(text,type = null) {
  reviewMsg.textContent = text;
  reviewMsg.classList.add("show");
  if(type == "review"){
    reviewMsg.style.color = "#22d3ee";
  }

  clearTimeout(reviewMsg._timeout);
  reviewMsg._timeout = setTimeout(() => {
    reviewMsg.classList.remove("show");
    reviewMsg.style.display = "none";
  }, 2000);
}