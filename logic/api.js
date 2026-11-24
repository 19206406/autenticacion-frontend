const ApiAuth = (function () {
  const API_BASE = "http://localhost:8080/api/auth";

  async function solicitar(ruta, opciones = {}) {
    let respuesta;
    try {
      respuesta = await fetch(API_BASE + ruta, {
        credentials: "include",
        ...opciones,
        headers: {
          "Content-Type": "application/json",
          ...(opciones.headers || {}),
        },
      });
    } catch (e) {
      const error = new Error("No se pudo conectar con el servidor.");
      error.status = 0;
      throw error;
    }

    let datos = null;
    if (respuesta.status !== 204) {
      try {
        datos = await respuesta.json();
      } catch (e) {
        datos = null;
      }
    }

    if (!respuesta.ok) {
      const error = new Error(
        (datos && datos.message) || "Error inesperado del servidor.",
      );
      error.status = respuesta.status;
      throw error;
    }
    return datos;
  }

  function enviarPost(ruta, cuerpo) {
    return solicitar(ruta, {
      method: "POST",
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  }

  function registrar({ fullName, email, password, confirmPassword }) {
    return enviarPost("/register", {
      fullName,
      email,
      password,
      confirmPassword,
    });
  }

  function iniciarSesion({ email, password }) {
    return enviarPost("/login", { email, password });
  }

  async function obtenerUsuarioActual() {
    try {
      return await solicitar("/me", { method: "GET" });
    } catch (error) {
      if (error.status === 401) return null;
      throw error;
    }
  }

  function cerrarSesion() {
    return enviarPost("/logout");
  }

  return { registrar, iniciarSesion, obtenerUsuarioActual, cerrarSesion };
})();
