//cart.js
const btnCart = document.getElementById("btn_cart");
const cartContainer = document.querySelector(".cart_container");
const msgBox = document.createElement("div");
const search = document.getElementById("search");
msgBox.className = "box";

//!disabling search & cart btn
if (window.location.pathname.includes('cart.html')) {
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
      if (data.error) {
        cartContainer.appendChild(msgBox);
        msgBox.innerHTML = `<h1><i class="fa-solid fa-box-open"></i>Your cart is empty</h1>`;
      } else {
        console.log(data.products);
      }
    });
}

loadCart();

function disableElem(elem){
  elem.disabled = true;
  elem.style.opacity = "0.5";
  elem.style.pointerEvents = "none";
}