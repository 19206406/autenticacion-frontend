/*
 * Cliente HTTP para el backend Spring Boot.
 *
 * Endpoints que consume:
 *   POST /api/auth/register  -> 201 { message, user }      | 400 / 409 { status, message, date }
 *   POST /api/auth/login     -> 200 { message, user }      | 400 / 401 { status, message, date }
 *   POST /api/auth/logout    -> 204 (sin cuerpo)
 *   GET  /api/users/{id}     -> 200 { id, fullName, email } | 401 / 404 { status, message, date }
 *
 * Toda respuesta no exitosa se convierte en un ApiError con el mensaje que envía
 * el backend, para que las páginas lo muestren en pantalla.
 */
const Api = (function () {
  // Se usa el mismo host desde el que se abrió el frontend (localhost o 127.0.0.1)
  // para que el navegador envíe la cookie de sesión JSESSIONID al backend.
  const HOST = window.location.hostname || "localhost";
  const API_BASE = "http://" + HOST + ":8080/api";
  const TIEMPO_LIMITE_MS = 10000;

  // Mensajes de respaldo cuando el backend no envía un "message".
  const MENSAJES_POR_ESTADO = {
    400: "Los datos enviados no son válidos.",
    401: "Debes iniciar sesión.",
    403: "Acceso denegado.",
    404: "El recurso solicitado no existe.",
    409: "El recurso ya existe.",
    500: "Ocurrió un error interno en el servidor.",
  };

  class ApiError extends Error {
    constructor(mensaje, status, datos) {
      super(mensaje);
      this.name = "ApiError";
      this.status = status; // 0 = sin conexión / tiempo agotado
      this.datos = datos;
    }
  }

  async function solicitar(ruta, opciones = {}) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE_MS);

    let respuesta;
    try {
      respuesta = await fetch(API_BASE + ruta, {
        credentials: "include",
        cache: "no-store",
        signal: controlador.signal,
        ...opciones,
        headers: {
          ...(opciones.body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(opciones.headers || {}),
        },
      });
    } catch (e) {
      const mensaje =
        e.name === "AbortError"
          ? "El servidor tardó demasiado en responder. Intenta de nuevo."
          : "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución en " +
            API_BASE.replace("/api", "") +
            ".";
      throw new ApiError(mensaje, 0, null);
    } finally {
      clearTimeout(temporizador);
    }

    // Se lee el cuerpo como texto para no fallar si viene vacío o no es JSON.
    let datos = null;
    const texto = await respuesta.text().catch(() => "");
    if (texto) {
      try {
        datos = JSON.parse(texto);
      } catch (e) {
        datos = null;
      }
    }

    if (!respuesta.ok) {
      const mensaje =
        (datos && typeof datos.message === "string" && datos.message) ||
        MENSAJES_POR_ESTADO[respuesta.status] ||
        (respuesta.status >= 500
          ? MENSAJES_POR_ESTADO[500]
          : "Error inesperado (código " + respuesta.status + ").");
      throw new ApiError(mensaje, respuesta.status, datos);
    }

    return { status: respuesta.status, datos };
  }

  function enviarPost(ruta, cuerpo) {
    return solicitar(ruta, {
      method: "POST",
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  }

  /** @returns {Promise<{message: string, user: {id, fullName, email}}>} */
  async function registrar({ fullName, email, password, confirmPassword }) {
    const { datos } = await enviarPost("/auth/register", {
      fullName,
      email,
      password,
      confirmPassword,
    });
    return datos;
  }

  /** @returns {Promise<{message: string, user: {id, fullName, email}}>} */
  async function iniciarSesion({ email, password }) {
    const { datos } = await enviarPost("/auth/login", { email, password });
    if (!datos || !datos.user || datos.user.id == null) {
      throw new ApiError("El servidor respondió sin los datos del usuario.", 200, datos);
    }
    return datos;
  }

  /** @returns {Promise<{id, fullName, email}>} Lanza ApiError 401 si no hay sesión. */
  async function obtenerUsuario(id) {
    const { datos } = await solicitar("/users/" + encodeURIComponent(id), {
      method: "GET",
    });
    return datos;
  }

  async function cerrarSesion() {
    await enviarPost("/auth/logout");
  }

  return { ApiError, registrar, iniciarSesion, obtenerUsuario, cerrarSesion };
})();
