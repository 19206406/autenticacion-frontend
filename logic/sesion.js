const Sesion = (function () {
  const PAGINA_LOGIN = "login.html";
  const PAGINA_BIENVENIDA = "bienvenida.html";

  async function exigirSesion() {
    let usuario = null;
    try {
      usuario = await ApiAuth.obtenerUsuarioActual();
    } catch (error) {
      usuario = null;
    }

    if (!usuario) {
      window.location.replace(PAGINA_LOGIN);
      return null;
    }

    document.body.classList.remove("verificando");
    return usuario;
  }

  async function redirigirSiHaySesion() {
    try {
      const usuario = await ApiAuth.obtenerUsuarioActual();
      if (usuario) {
        window.location.replace(PAGINA_BIENVENIDA);
        return true;
      }
    } catch (error) {}
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
    exigirSesion,
    redirigirSiHaySesion,
    revalidarAlVolver,
  };
})();
