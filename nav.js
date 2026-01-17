const prCount = document.querySelector(".pr_count");

if(prCount){
    fetch("https://api.everrest.educata.dev/shop/cart", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
  }).then(answ=>answ.json())
  .then((data)=>{
    prCount.textContent = data.products.length;
  })
}
