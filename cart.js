const btnCart = document.getElementById("btn_cart");
const cartContainer = document.querySelector(".cart_container");
const msgBox = document.createElement("div");
const search = document.getElementById("search");
msgBox.className = "box";

const subTotalPriceCont = document.querySelector(".subtotal_price");
const totalPriceCont = document.querySelector(".total_price");

const checkoutBtn = document.querySelector(".confirm_btn");
checkoutBtn.addEventListener("click",()=>{
  checkout();
})

//!disabling search & cart btn
if (window.location.pathname.includes("cart.html")) {
  disableElem(btnCart);
  disableElem(search);
}

//!checking
function loadCart(clear = true) {
  fetch("https://api.everrest.educata.dev/shop/cart", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
  })
    .then((answ) => {
      if (!answ.ok) {
        return { error: true, products: [] };
      }
      return answ.json();
    })
    .then((data) => {
      if (data.error || !data.products || data.products.length === 0) {
        showEmptyCart();
        updateCheckout(0, 0);
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = 0.5;
        checkoutBtn.style.pointerEvents = "none";
      } else {
        if (clear) { 
          cartContainer.innerHTML = "";
          
          data.products.forEach((item) => {
            fetch(
              `https://api.everrest.educata.dev/shop/products/id/${item.productId}`,
            )
              .then((answ) => answ.json())
              .then((pr) => {
                displayProduct(pr, item);
              });
          });
        }
        const subtotal = data.total.price.beforeDiscount || 0;
        const total = data.total.price.current || 0;
        updateCheckout(subtotal, total);
      }
    }).catch((err)=>{
      console.log("no cart available");
    })
}

loadCart();

function updateCheckout(subtotal, total) {
  subTotalPriceCont.textContent = `$${subtotal.toFixed(1)}`;
  totalPriceCont.textContent = `$${total.toFixed(1)}`;
}

function checkEmptyCart() {
  const cards = cartContainer.querySelectorAll(".card");
  if (cards.length === 0) {
    showEmptyCart();
  }
}

function showEmptyCart() {
  cartContainer.innerHTML = "";
  cartContainer.appendChild(msgBox);
  msgBox.innerHTML = `<h1><i class="fa-solid fa-box-open"></i>Your cart is empty</h1>`;
}

function disableElem(elem) {
  elem.disabled = true;
  elem.style.opacity = "0.5";
  elem.style.pointerEvents = "none";
}

function displayProduct(pr, item) {
  let quantity = item.quantity;
  let totalPrice = (pr.price.current * quantity).toFixed(1);
  let priceBefDiscHTML = "";
  if (pr.price.discountPercentage > 0) {
    priceBefDiscHTML = `<span class="pr_bef_disc">${pr.price.beforeDiscount}</span>`;
  }

  const card = document.createElement("div");
  card.className = "card";
  card.id = pr._id;
  card.innerHTML = `
          <img
            src="${pr.thumbnail}"
            alt="${pr.title} + img"
            onerror="
              this.onerror = null;
              this.src = 'backupImg.jpg';
            "
          />
          <div class="info">
            <div class="title_field">
              <h1>${pr.title}</h1>
            </div>
            <div class="ratings_field">
              <div class="sub_f">
                <p>RATING</p>
                <span class="sp_cont">
                  <i class="fa-solid fa-star"  style="color: gold;"></i>
                  <span style="color: var(--w);">${pr.rating.toFixed(1)}</span>
                </span>
              </div>
              <div class="sub_f">
                <p>REVIWEVS</p>
                <span class="sp_cont">
                  <i class="fa-solid fa-message" style="color: #22d3ee;"></i>
                  <span style="color: #22d3ee;">${pr.ratings.length}</span>
                </span>
              </div>
              <div class="sub_f">
                <p>AVAILABILITY</p>
                <span class="sp_cont">
                  <i class="fa-solid fa-circle" style="color: lime; font-size: 8px;"></i>
                  <span style="color: lime;">${pr.stock} IN STOCK</span>
                </span>
              </div>
            </div>
            <div class="price_field">
              <p>PRICE</p>
              <span>$${pr.price.current}  ${priceBefDiscHTML}</span>
            </div>
            <div class="divider"></div>
            <div class="last_field">
              <div class="sub_f">
                <p>CHANGE QUANTITY</p>
                <div class="qunatity_cont">
                  <button class="qty_btn decr">−</button>
                  <span class="qty_number">${quantity}</span>
                  <button class="qty_btn incr">+</button>
                </div>
              </div>
              <div class="sub_f">
                <p>TOTAL PRICE</p>
                <span class="total_price">$${totalPrice}</span>
              </div>
            </div>
          </div>
          <div class="remove_pr"><i class="fa-solid fa-trash"></i></div>
  `;

  cartContainer.appendChild(card);

  card.addEventListener("click",()=>{
    goToDetailsPage(card.id);
  })

  const qtyNumber = card.querySelector(".qty_number");
  const totalPriceElem = card.querySelector(".total_price");
  const incrBtn = card.querySelector(".incr");
  const decrBtn = card.querySelector(".decr");
  const removePrBtn = card.querySelector(".remove_pr");

  const updateUI = () => {
    qtyNumber.textContent = quantity;
    totalPriceElem.textContent = `$${(pr.price.current * quantity).toFixed(1)}`;
  };

  incrBtn.addEventListener("click", () => {
    if (quantity < pr.stock) {
      quantity++;
      updateUI();
      updateCart(pr._id, quantity);
    }
  });

  decrBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      updateUI();
      updateCart(pr._id, quantity);
    } else if (quantity == 1) {
      removeProduct(pr._id, card);
    }
  });

  removePrBtn.addEventListener("click", () => {
    removeProduct(pr._id, card);
    updateUI();
  });
}

function goToDetailsPage(id){
  sessionStorage.setItem("prId",id);
  window.location.href = 'details.html';
}

function updateCart(id, Nquantity) {
  fetch("https://api.everrest.educata.dev/shop/cart/product", {
    method: "PATCH",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      quantity: Nquantity,
    }),
  })
    .then((answ) => answ.json())
    .then((data) => {
      console.log(data);
      loadCart(false);
    })
    .catch((error) => {
      console.error("Error updating", error);
    });
}

function removeProduct(id, card) {
  fetch("https://api.everrest.educata.dev/shop/cart/product", {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    }),
  })
    .then((answ) => answ.json())
    .then((data) => {
      card.remove();
      checkEmptyCart();
      updateCart(false);
    })
    .catch((error) => {
      console.error("Error removing", error);
    });
}


function checkout(){
  fetch("https://api.everrest.educata.dev/shop/cart/checkout",{
    method:"POST",
    headers:{
      accept: "*/*",
      Authorization: `Bearer ${Cookies.get("user")}`
    }
  })
  .then((answ)=>answ.json())
  .then((data)=>{
    console.log(data);
    loadCart();
    showCheckoutMessage("PURCHASE SUCCESSFUL");
  })
  .catch(err=>{
    console.log("Error checking out: ", err);
  })
}

const checkoutMsg = document.querySelector(".checkout_msg");

function showCheckoutMessage(text) {
  checkoutMsg.textContent = text;
  checkoutMsg.className = `checkout_msg show`;

  setTimeout(() => {
    checkoutMsg.classList.remove("show");
  }, 1500);
}
