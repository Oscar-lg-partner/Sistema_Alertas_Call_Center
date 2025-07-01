const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const result = await window.api.register(username, password);

  if (result.success) {
    await window.api.showMessage("Usuario registrado correctamente");
    window.location.href = "index.html"; // vuelve al login
  } else {
    await window.api.showMessage("Error: " + result.message);
  }
});
