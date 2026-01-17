//cart.js
const btnCart = document.getElementById("btn_cart");
const cartContainer = document.querySelector(".cart_container");
const msgBox = document.createElement("div");
const search = document.getElementById("search");
msgBox.className = "box";

//!disabling search & cart btn
if (window.location.pathname.includes("cart.html")) {
  disableElem(btnCart);
  disableElem(search);
}

//!checking
function loadCart() {
  fetch("https://api.everrest.educata.dev/shop/cart", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
  })
    .then((answ) => answ.json())
    .then((data) => {
      console.log(data);
      
      if (data.error) {
        cartContainer.appendChild(msgBox);
        msgBox.innerHTML = `<h1><i class="fa-solid fa-box-open"></i>Your cart is empty</h1>`;
      } else {
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
    });
}

loadCart();

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
    }
  });

  removePrBtn.addEventListener("click", () => {
    removeProduct(pr._id,card);
    updateUI();
  });
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
    })
    .catch((error) => {
      console.error("Error updating", error);
    });
}

function removeProduct(id,card) {
  fetch("https://api.everrest.educata.dev/shop/cart/product", {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    })
  })
    .then((answ) => answ.json())
    .then((data) => {
      card.remove();

       if (cartContainer.querySelectorAll('.card').length == 0) {
        console.log(cartContainer.querySelectorAll('.card').length);
        
        cartContainer.appendChild(msgBox);
        msgBox.innerHTML = `<h1><i class="fa-solid fa-box-open"></i>Your cart is empty</h1>`;
      }
    })
    .catch((error) => {
      console.error("Error removing", error);
    });
}
