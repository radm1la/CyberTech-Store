//auth.js
const btnAuth = document.getElementById("btn_auth");
const leftSideOfNav = document.querySelector(".left_side");

btnAuth.addEventListener("click", () => {
  const userToken = Cookies.get("user");
  if (!userToken) {
    openAuth();
  }
});

function checkForUser() {
  const userToken = Cookies.get("user");
  const btnCart = document.getElementById("btn_cart");

  btnAuth.disabled = false;
  btnAuth.style.color = "";
  btnAuth.innerHTML = "AUTHENTICATE";

  const prevSignout = document.getElementById("signout_btn");
  if (prevSignout) prevSignout.remove();

  if (userToken) {
    fetch("https://api.everrest.educata.dev/auth", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((answ) => answ.json())
      .then((userData) => {
        if (userData.verified) {
          const authForm = document.querySelector(".auth_form");
          if (authForm) authForm.remove();
          btnAuth.disabled = true;
          btnAuth.innerHTML = `<i class="fa-solid fa-user"></i> ${userData.firstName}`;

          if (!window.location.pathname.includes("cart.html")) {
            btnCart.disabled = false;
            btnCart.style.opacity = "1";
            btnCart.style.pointerEvents = "auto";
          }

          const signoutBtn = document.createElement("span");
          signoutBtn.className = "i_anim";
          signoutBtn.id = "signout_btn";
          signoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i>`;
          leftSideOfNav.appendChild(signoutBtn);

          signoutBtn.addEventListener("click", handleSignOut);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
      });
  } else {
    btnCart.disabled = true;
    btnCart.style.opacity = "0.5";
    btnCart.style.pointerEvents = "none";
  }
}

checkForUser();

function handleSignOut() {
  Cookies.remove("user");
  checkForUser();

  localStorage.setItem("auth_changed", Date.now());
}

function openAuth() {
  const form = document.createElement("div");
  form.className = "auth_form";
  form.innerHTML = `
        <div class="auth_window">
            <span class="close_auth"><i class="fa-solid fa-x"></i></span>
            <div class="auth_content"></div>
        </div>
     `;

  document.body.appendChild(form);

  document.querySelector(".close_auth").onclick = () => form.remove();

  showLogin();
}

function showLogin() {
  const authContent = document.querySelector(".auth_content");

  authContent.innerHTML = `
    <h2>CUSTOMER SIGN IN</h2>
    <p>ENTER YOUR CREDENTIALS</p>
    <p class="auth_error" id="loginError" style="display:none"></p>

    <form id="loginForm">
      <div class="input_area">
          <i class="fa-solid fa-envelope"></i>
          <input type="email" id="login_email" placeholder="Email" name="email" required/>
      </div>
      <div class="input_area">
          <i class="fa-solid fa-lock"></i>
          <input type="password" id="login_password" placeholder="Password" name="password" required/>
      </div>

      <button type="submit" id="loginBtn">LOGIN</button>
    </form>

    <p class="switch">
      DON'T HAVE AN ACCOUNT?
      <span id="goSignup">SIGN UP</span>
    </p>
  `;

  document.getElementById("goSignup").onclick = showSignup;

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

function showSignup() {
  const content = document.querySelector(".auth_content");

  content.innerHTML = `
    <h2>CREATE ACCOUNT</h2>
    <p>JOIN OUR REGISTRY</p>
    <p class="auth_error" id="signupError" style="display:none"></p>

    <form id="signupForm">
      <div class="signup_container">
        <div class="inputs_column">
          <div class="input_area">
            <i class="fa-solid fa-id-card"></i>
            <input type="text" id="firstName" placeholder="FIRST NAME" name="firstName" required/>
          </div>
          <div class="input_area">
            <i class="fa-solid fa-user"></i>
            <input type="text" id="lastName" placeholder="LAST NAME" name="lastName" required/>
          </div>
          <div class="input_area">
            <i class="fa-solid fa-hashtag"></i>
            <input type="number" id="age" placeholder="AGE" name="age" required/>
          </div>
          <div class="input_area gender_area">
            <i class="fa-solid fa-chevron-down"></i>
            <i class="fa-solid fa-venus-mars"></i>
            <select id="gender" name="gender" required>
              <option value="">SELECT GENDER</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div class="input_area">
            <i class="fa-solid fa-envelope"></i>
            <input type="email" id="signup_email" placeholder="EMAIL" name="email" required/>
          </div>
        </div>

        <div class="inputs_column">
          <div class="input_area">
            <i class="fa-solid fa-phone"></i>
            <input type="text" id="phone" placeholder="PHONE" name="phone" required/>
          </div>
          <div class="input_area">
            <i class="fa-solid fa-map-pin"></i>
            <input type="text" id="address" placeholder="ADDRESS" name="address" required/>
          </div>
          <div class="input_area">
            <i class="fa-solid fa-location-dot"></i>
            <input type="text" id="zipcode" placeholder="ZIPCODE" name="zipcode" required/>
          </div>
          <div class="input_area">
            <i class="fa-solid fa-image"></i>
            <input type="text" id="avatar" placeholder="AVATAR URL" name="avatar"/>
          </div>
          <div class="input_area">
            <i class="fa-solid fa-lock"></i>
            <input type="text" id="signup_password" placeholder="PASSWORD" name="password" required/>
          </div>
        </div>
      </div>
      
      <button type="submit" id="signupBtn">REGISTER NOW</button>
    </form>

    <p class="switch">
      Already have an account?
      <span id="goLogin">BACK TO LOGIN</span>
    </p>
  `;

  document.getElementById("goLogin").onclick = showLogin;

  document
    .getElementById("signupForm")
    .addEventListener("submit", handleSignup);
}

function handleLogin(e) {
  e.preventDefault();

  let formInfo = new FormData(e.target);
  let finalForm = Object.fromEntries(formInfo);

  const errorBox = document.querySelector(".auth_error");
  errorBox.innerHTML = "";
  errorBox.style.display = "none";

  fetch("https://api.everrest.educata.dev/auth/sign_in", {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalForm),
  })
    .then((answ) => answ.json())
    .then((data) => {
      if (data.access_token) {
        Cookies.set("user", data.access_token);

        return fetch("https://api.everrest.educata.dev/auth", {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${data.access_token}`,
          },
        }).then((res) => res.json());
      } else {
        throw new Error(data.error || "INVALID EMAIL OR PASSWORD.");
      }
    })
    .then((userData) => {
      if (userData.verified) {
        errorBox.style.color = "lime";
        errorBox.innerHTML = "LOGIN SUCCESSFUL!";
        errorBox.style.display = "block";

        setTimeout(() => {
          checkForUser();
        }, 1000);
      } else {
        errorBox.style.color = "orange";
        errorBox.innerHTML = "PLEASE VERIFY YOUR EMAIL BEFORE LOGGING IN.";
        errorBox.style.display = "block";
        //Cookies.remove("user");
      }
    })
    .catch((err) => {
      errorBox.style.color = "red";
      errorBox.innerHTML = err.message || "CONNECTION ERROR. TRY AGAIN.";
      errorBox.style.display = "block";
      console.error(err);
    });
}
function handleSignup(e) {
  e.preventDefault();

  let formInfo = new FormData(e.target);
  let finalForm = Object.fromEntries(formInfo);
  finalForm.age = Number(finalForm.age);

  const errorBox = document.querySelector(".auth_error");
  errorBox.textContent = "";
  errorBox.style.display = "none";

  fetch("https://api.everrest.educata.dev/auth/sign_up", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalForm),
  })
    .then((pasuxi) => pasuxi.json())
    .then((data) => {
      if (data._id) {
        errorBox.style.color = "lime";
        errorBox.textContent = "ACCOUNT CREATED SUCCESSFULLY!.";
        errorBox.style.display = "block";

        setTimeout(() => {
          showLogin();
        }, 1000);
      } else if (data.error) {
        let message = "SIGNUP FAILED. CHECK YOUR INPUTS.";

        if (
          data.error.toLowerCase().includes("email") &&
          data.error.toLowerCase().includes("already")
        ) {
          message =
            "THIS EMAIL IS ALREADY REGISTERED. PLEASE LOGIN OR USE A DIFFERENT EMAIL.";
        } else {
          message = data.error.toUpperCase();
        }

        errorBox.style.color = "red";
        errorBox.textContent = message;
        errorBox.style.display = "block";
      }
    })
    .catch((err) => {
      errorBox.style.color = "red";
      errorBox.textContent = "SOMETHING WENT WRONG. TRY AGAIN.";
      errorBox.style.display = "block";
      console.error(err);
    });
}
