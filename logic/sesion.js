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

  async function verificar() {
    const id = leerIdUsuario();
    if (!id) return { usuario: null, error: null };

    try {
      const usuario = await Api.obtenerUsuario(id);
      return { usuario, error: null };
    } catch (error) {
      if (error.status === 401 || error.status === 404) olvidarUsuario();
      return { usuario: null, error };
    }
  }

  async function exigirSesion() {
    const { usuario, error } = await verificar();

    if (!usuario) {
      let mensaje = "Debes iniciar sesión para acceder a tu espacio.";
      if (error && (error.status === 401 || error.status === 404)) {
        mensaje = "Tu sesión no está activa o expiró. Inicia sesión de nuevo.";
      } else if (error) {
        mensaje = "No se pudo verificar tu sesión. " + error.message;
      }
      Utils.guardarAviso("avisoLogin", "error", mensaje);
      window.location.replace(PAGINA_LOGIN);
      return null;
    }

    document.body.classList.remove("verificando");
    return usuario;
  }

  async function redirigirSiHaySesion() {
    const { usuario } = await verificar();
    if (usuario) {
      window.location.replace(PAGINA_BIENVENIDA);
      return true;
    }
    return false;
  }

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
