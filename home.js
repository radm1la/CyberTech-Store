const categories = document.getElementById("categories");
const brandsCont = document.getElementById("brands");

//!CATEGORIES
fetch("https://api.everrest.educata.dev/shop/products/categories")
.then((answ)=>answ.json())
.then((cats)=>{
    cats.forEach(cat => {
        showCategorie(cat);
    });
})

function showCategorie(cat){
    categories.innerHTML += `
        <option value="${cat.id}">${cat.name}</option>
    `;
}

//!BRANDS
fetch("https://api.everrest.educata.dev/shop/products/brands")
.then((answ)=>answ.json())
.then((brands)=>{
    brands.forEach((brand)=>{
        brandsCont.innerHTML +=`
            <input type="radio" name="brand" value="${brand}">
            <label for="${brand}">${brand}</label>
        `
    })
})

//!PRICE

