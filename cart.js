//cart.js
const btnCart = document.getElementById("btn_cart");
const cartContainer = document.querySelector(".cart_container");

btnCart.addEventListener("click", () => {
  window.location.href = "cart.html";
});

fetch("https://api.everrest.educata.dev/shop/cart", {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${Cookies.get("user")}`,
  }
}).then((answ)=>answ.json())
.then((data)=>{
    // !aq gamochena productebis
})
