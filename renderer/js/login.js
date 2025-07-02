console.log("aqui");

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value.trim();

  try {
    const result = await window.api.login(username, password);
    if (result.success) {
      // En tu login.js, después de login exitoso:
      localStorage.setItem("userId", result.userId);
      window.location.href = "dashboard.html";
      // await window.api.showMessage("Login exitoso");
      window.location.href = "dashboard.html";
    } else {
      await window.api.showMessage("Error: " + result.message);
    }
  } catch (error) {
    await window.api.showMessage("Error inesperado al hacer login");
    console.error(error);
  }
});
