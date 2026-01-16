//cart.js
const btnCart = document.getElementById("btn_cart");
const cartContainer = document.querySelector(".cart_container");
const msgBox = document.createElement("div");
msgBox.className = "box";

btnCart.addEventListener("click", () => {
  window.location.href = "cart.html";
});

//!checking
let userToken = Cookies.get("user");

function loadCart() {
  if (!userToken) {
    cartContainer.appendChild(msgBox);
    msgBox.innerHTML = `<h1><i class="fa-solid fa-circle-xmark"></i> LOGIN REQUIRED TO ACCESS YOUR CART</h1>`;
  } else {
    fetch("https://api.everrest.educata.dev/shop/cart", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${Cookies.get("user")}`,
      },
    })
      .then((answ) => answ.json())
      .then((data) => {
        if (data.error) {
          cartContainer.appendChild(msgBox);
          msgBox.innerHTML = `<h1><i class="fa-solid fa-box-open"></i>Your cart is empty</h1>`;
        } else {
          console.log(data.products);
          
        }
      });
  }
}

loadCart();
