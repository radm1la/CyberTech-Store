//!disable search
const search = document.getElementById("search");
disableElem(search);

//!fetching user info
let originalUserData = {};

function getUser() {
  fetch("https://api.everrest.educata.dev/auth", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
  })
    .then((answ) => answ.json())
    .then((user) => {
      console.log(user);
      originalUserData = { ...user };
      displayInfo(user);
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
}

getUser();

//!display info
const userAvatar = document.getElementById("user_avatar");
const userFullname = document.getElementById("user_fullname");
const userEmail = document.getElementById("user_email");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const age = document.getElementById("age");
const gender = document.getElementById("gender");
const address = document.getElementById("address");
const phone = document.getElementById("phone");
const zipcode = document.getElementById("zipcode");
const avatar = document.getElementById("avatar");

function displayInfo(user) {
  userAvatar.src = user.avatar;
  userAvatar.onerror = function () {
    this.src = "/other/pfp_img.png";
  };
  userFullname.textContent = user.firstName + " " + user.lastName;
  userEmail.textContent = user.email;

  firstName.value = user.firstName;
  lastName.value = user.lastName;
  age.value = user.age;
  gender.value = user.gender;
  address.value = user.address;
  phone.value = user.phone;
  zipcode.value = user.zipcode;
  avatar.value = user.avatar || "";
}

//!editing user info
const editBtn = document.getElementById("edit_btn");
const saveBtn = document.getElementById("save_btn");
const editMsg = document.querySelector(".msg");

editBtn.addEventListener("click", () => {
  enableDisableEditing("enable");
});

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fetchChanges();
});

function enableDisableEditing(action) {
  if (action == "enable") {
    firstName.removeAttribute("readonly");
    lastName.removeAttribute("readonly");
    age.removeAttribute("readonly");
    gender.removeAttribute("disabled");
    address.removeAttribute("readonly");
    phone.removeAttribute("readonly");
    zipcode.removeAttribute("readonly");
    avatar.removeAttribute("readonly");

    editBtn.style.display = "none";
    saveBtn.style.display = "flex";
  } else {
    firstName.setAttribute("readonly", true);
    lastName.setAttribute("readonly", true);
    age.setAttribute("readonly", true);
    gender.setAttribute("disabled", true);
    address.setAttribute("readonly", true);
    phone.setAttribute("readonly", true);
    zipcode.setAttribute("readonly", true);
    avatar.setAttribute("readonly", true);

    saveBtn.style.display = "none";
    editBtn.style.display = "flex";
  }
}

function hasDataChanged(newData) {
  return (
    newData.firstName !== originalUserData.firstName ||
    newData.lastName !== originalUserData.lastName ||
    newData.age !== String(originalUserData.age) ||
    newData.gender !== originalUserData.gender ||
    newData.address !== originalUserData.address ||
    newData.phone !== originalUserData.phone ||
    newData.zipcode !== originalUserData.zipcode ||
    newData.avatar !== (originalUserData.avatar || "")
  );
}

//fetching changes
function fetchChanges() {
  const profileForm = document.getElementById("profile_form");
  let formInfo = new FormData(profileForm);
  let finalForm = Object.fromEntries(formInfo);

  const validation = validateProfileInputs(finalForm);
  if (!validation.valid) {
    editMsg.textContent = validation.message;
    editMsg.style.display = "block";
    editMsg.style.color = "#ef4444";
    setTimeout(() => {
      editMsg.style.display = "none";
    }, 2000);
    return;
  }

  if (!hasDataChanged(finalForm)) {
    editMsg.textContent = "PLEASE CHANGE SOMETHING BEFORE SAVING";
    editMsg.style.display = "block";
    editMsg.style.color = "#ef4444";
    setTimeout(() => {
      editMsg.style.display = "none";
    }, 2000);
    return;
  }

  fetch("https://api.everrest.educata.dev/auth/update", {
    method: "PATCH",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
    body: JSON.stringify(finalForm),
  })
    .then((answ) => answ.json())
    .then((data) => {
      getUser();
      originalUserData = { ...data };
      enableDisableEditing("disable");
      editMsg.textContent = "PROFILE UPDATED SUCCESSFULLY";
      editMsg.style.color = "#10b981";
      editMsg.style.display = "block";
      setTimeout(() => {
        editMsg.style.display = "none";
      }, 2000);
    })
    .catch((err) => {
      console.log("Error: ", err);
      editMsg.textContent = "ERROR UPDATING PROFILE";
      editMsg.style.display = "block";
      setTimeout(() => {
        editMsg.style.display = "none";
      }, 2000);
    });
}

function validateProfileInputs(formData) {
  const nameRegex = /^[A-Za-z]/;

  if (!formData.firstName || formData.firstName.trim() === "") {
    return { valid: false, message: "FIRST NAME IS REQUIRED" };
  }

  if (!nameRegex.test(formData.firstName)) {
    return { valid: false, message: "FIRST NAME MUST START WITH A LETTER" };
  }

  if (!formData.lastName || formData.lastName.trim() === "") {
    return { valid: false, message: "LAST NAME IS REQUIRED" };
  }

  if (!nameRegex.test(formData.lastName)) {
    return { valid: false, message: "LAST NAME MUST START WITH A LETTER" };
  }

  if (!formData.age || formData.age < 13 || formData.age > 120) {
    return { valid: false, message: "PLEASE ENTER A VALID AGE (13-120)" };
  }

  const phoneRegex = /^\+995\d{9}$/;
  if (!formData.phone || !phoneRegex.test(formData.phone)) {
    return { valid: false, message: "PLEASE ENTER A VALID PHONE NUMBER" };
  }

  if (!formData.address || formData.address.trim() === "") {
    return { valid: false, message: "ADDRESS IS REQUIRED" };
  }

  if (!formData.zipcode || formData.zipcode.trim() === "") {
    return { valid: false, message: "ZIP CODE IS REQUIRED" };
  }

  if (formData.avatar && formData.avatar.trim() !== "") {
    const urlRegex =
      /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

    if (!urlRegex.test(formData.avatar)) {
      return {
        valid: false,
        message: "INVALID AVATAR URL. EXAMPLE: https://example.com/avatar.jpg",
      };
    }
  }

  return { valid: true };
}
//!deleting account
const deleteBtn = document.getElementById("delete_account_btn");

deleteBtn.addEventListener("click", () => {
  deleteAccount();
});

function deleteAccount() {
  fetch("https://api.everrest.educata.dev/auth/delete", {
    method: "DELETE",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
  })
    .then((answ) => answ.json())
    .then((data) => {
      showDeleteMsg();
    })
    .catch((err) => {
      console.log("Error while deleting account: ", err);
    });
}

function showDeleteMsg() {
  const overlay = document.createElement("div");
  overlay.className = "delete_popup_overlay";

  const popup = document.createElement("div");
  popup.className = "delete_popup";
  popup.innerHTML = `<h2>ACCOUNT DELETED</h2>`;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  setTimeout(() => {
    Cookies.remove("user");
    window.location.href = "../index.html";
  }, 1500);
}

//!helpers
function disableElem(elem) {
  elem.disabled = true;
  elem.style.opacity = "0.5";
  elem.style.pointerEvents = "none";
}

//!change password
const passwordForm = document.getElementById("password_form");
const passMsg = document.querySelector(".pass_msg");

passwordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  changePassword();
});

function changePassword() {
  const formData = new FormData(passwordForm);
  const oldPass = formData.get("old_password");
  const newPass = formData.get("new_password");

  fetch("https://api.everrest.educata.dev/auth/change_password", {
    method: "PATCH",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("user")}`,
    },
    body: JSON.stringify({
      oldPassword: oldPass,
      newPassword: newPass,
    }),
  })
    .then((answ) => answ.json())
    .then((data) => {
      if (data.error) {
        if (data.errorKeys[0] == "errors.password_too_short") {
          passMsg.style.color = "#ef4444";
          passMsg.textContent = "NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS";
          passMsg.style.display = "block";
          setTimeout(() => {
            editMsg.style.display = "none";
          }, 2000);
          return;
        }
        passMsg.style.color = "#ef4444";
        passMsg.textContent = data.error.toUpperCase();
        passMsg.style.display = "block";
        setTimeout(() => {
          passMsg.style.display = "none";
        }, 2000);
        return;
      } else {
        passMsg.style.color = "#10b981";
        passMsg.textContent = "PASSWORD CHANGED SUCCESSFULLY";
        passMsg.style.display = "block";

        passwordForm.reset();

        setTimeout(() => {
          passMsg.style.display = "none";
        }, 2000);
      }
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
}
