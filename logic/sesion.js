/*
 * Manejo de la sesión en el cliente.
 *
 * La sesión real vive en el backend (cookie HttpOnly JSESSIONID). El frontend solo
 * guarda el id del usuario devuelto por el login, para poder consultar
 * GET /api/users/{id}: si responde 200 la sesión está activa; si responde 401
 * la sesión no existe o expiró.
 */
const Sesion = (function () {
  const PAGINA_LOGIN = "login.html";
  const PAGINA_BIENVENIDA = "bienvenida.html";
  const CLAVE_ID = "idUsuarioSesion";

  function guardarIdUsuario(id) {
    try {
      sessionStorage.setItem(CLAVE_ID, String(id));
    } catch (e) {}
  }

  function leerIdUsuario() {
    try {
      return sessionStorage.getItem(CLAVE_ID);
    } catch (e) {
      return null;
    }
  }

  function olvidarUsuario() {
    try {
      sessionStorage.removeItem(CLAVE_ID);
    } catch (e) {}
  }

  /**
   * Consulta al backend si la sesión sigue activa.
   * @returns {Promise<{usuario: object|null, error: ApiError|null}>}
   */
  async function verificar() {
    const id = leerIdUsuario();
    if (!id) return { usuario: null, error: null };

    try {
      const usuario = await Api.obtenerUsuario(id);
      return { usuario, error: null };
    } catch (error) {
      // 401: sin sesión / expirada. 404: el usuario ya no existe (p. ej. el backend se reinició).
      if (error.status === 401 || error.status === 404) olvidarUsuario();
      return { usuario: null, error };
    }
  }

  /** Para páginas privadas: si no hay sesión válida, redirige al login con un mensaje. */
  async function exigirSesion() {
    const { usuario, error } = await verificar();

    if (!usuario) {
      let mensaje = "Debes iniciar sesión para acceder a tu espacio.";
      if (error && (error.status === 401 || error.status === 404)) {
        mensaje = "Tu sesión no está activa o expiró. Inicia sesión de nuevo.";
      } else if (error) {
        // Sin conexión, error 500, etc.: se muestra el motivo real.
        mensaje = "No se pudo verificar tu sesión. " + error.message;
      }
      Utils.guardarAviso("avisoLogin", "error", mensaje);
      window.location.replace(PAGINA_LOGIN);
      return null;
    }

    document.body.classList.remove("verificando");
    return usuario;
  }

  /** Para login y registro: si ya hay una sesión activa, va directo a la bienvenida. */
  async function redirigirSiHaySesion() {
    const { usuario } = await verificar();
    if (usuario) {
      window.location.replace(PAGINA_BIENVENIDA);
      return true;
    }
    return false;
  }

  /** Vuelve a validar cuando el navegador restaura la página desde su caché (botón Atrás). */
  function revalidarAlVolver(funcionDeValidacion) {
    window.addEventListener("pageshow", function (evento) {
      if (evento.persisted) funcionDeValidacion();
    });
  }

  return {
    PAGINA_LOGIN,
    PAGINA_BIENVENIDA,
    guardarIdUsuario,
    olvidarUsuario,
    verificar,
    exigirSesion,
    redirigirSiHaySesion,
    revalidarAlVolver,
  };
})();
