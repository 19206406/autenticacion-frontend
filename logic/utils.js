const Utils = (function () {
  function mostrarAviso(elemento, mensaje, esExito = false) {
    elemento.textContent = mensaje;
    elemento.classList.toggle("exito", esExito);
    elemento.hidden = false;
  }

  function ocultarAviso(elemento) {
    elemento.textContent = "";
    elemento.hidden = true;
    elemento.classList.remove("exito");
  }

  function marcarCampo(elemento, tieneError) {
    elemento.setAttribute("aria-invalid", tieneError ? "true" : "false");
  }

  function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  }

  function esClaveValida(clave) {
    return clave.length >= 8 && /[A-Z]/.test(clave) && /[0-9]/.test(clave);
  }

  function activarAlternarClave() {
    for (const boton of document.querySelectorAll(".alternar-clave")) {
      boton.addEventListener("click", function () {
        const campo = document.getElementById(boton.dataset.campo);
        const mostrar = campo.type === "password";
        campo.type = mostrar ? "text" : "password";
        boton.textContent = mostrar ? "OCULTAR" : "MOSTRAR";
        boton.setAttribute(
          "aria-label",
          (mostrar ? "Ocultar" : "Mostrar") + " contraseña",
        );
      });
    }
  }

  function guardarMensaje(clave, valor) {
    try {
      sessionStorage.setItem(clave, valor);
    } catch (e) {}
  }

  function leerMensaje(clave) {
    try {
      const valor = sessionStorage.getItem(clave);
      sessionStorage.removeItem(clave);
      return valor;
    } catch (e) {
      return null;
    }
  }

  return {
    mostrarAviso,
    ocultarAviso,
    marcarCampo,
    esCorreoValido,
    esClaveValida,
    activarAlternarClave,
    guardarMensaje,
    leerMensaje,
  };
})();
