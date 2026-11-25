const Utils = (function () {
  const TITULOS = {
    error: "Algo salió mal",
    exito: "Listo",
    info: "Un momento",
  };

  /**
   * Muestra un aviso en pantalla.
   * @param {HTMLElement} elemento contenedor .aviso
   * @param {"error"|"exito"|"info"} tipo
   * @param {string} mensaje texto (normalmente el "message" que devolvió el backend)
   * @param {string} [titulo]
   */
  function mostrarAviso(elemento, tipo, mensaje, titulo) {
    elemento.replaceChildren();
    elemento.classList.remove("error", "exito", "info");
    elemento.classList.add(tipo);
    // Los errores se anuncian de inmediato a lectores de pantalla.
    elemento.setAttribute("role", tipo === "error" ? "alert" : "status");

    const encabezado = document.createElement("strong");
    encabezado.className = "aviso-titulo";
    encabezado.textContent = titulo || TITULOS[tipo];

    const texto = document.createElement("span");
    texto.className = "aviso-texto";
    texto.textContent = mensaje;

    elemento.append(encabezado, texto);
    elemento.hidden = false;
  }

  /** Muestra el error de una petición, con el código HTTP cuando existe. */
  function mostrarErrorApi(elemento, error, titulo) {
    const codigo = error && error.status ? " (" + error.status + ")" : "";
    mostrarAviso(
      elemento,
      "error",
      (error && error.message) || "Ocurrió un error inesperado.",
      (titulo || TITULOS.error) + codigo,
    );
  }

  function ocultarAviso(elemento) {
    elemento.replaceChildren();
    elemento.hidden = true;
    elemento.classList.remove("error", "exito", "info");
  }

  /** Marca un campo como válido/inválido y muestra su mensaje debajo. */
  function marcarCampo(campo, mensajeError) {
    const tieneError = Boolean(mensajeError);
    campo.setAttribute("aria-invalid", tieneError ? "true" : "false");

    const idMensaje = campo.id + "-error";
    let nodo = document.getElementById(idMensaje);
    if (!nodo) {
      nodo = document.createElement("p");
      nodo.id = idMensaje;
      nodo.className = "error-campo";
      campo.closest(".grupo-campo").append(nodo);
      campo.setAttribute("aria-describedby", idMensaje);
    }
    nodo.textContent = tieneError ? mensajeError : "";
    nodo.hidden = !tieneError;
  }

  function limpiarCampos(formulario) {
    for (const campo of formulario.querySelectorAll("input")) marcarCampo(campo, "");
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
        boton.setAttribute("aria-label", (mostrar ? "Ocultar" : "Mostrar") + " contraseña");
      });
    }
  }

  /** Pone el botón en estado "cargando" y devuelve una función para restaurarlo. */
  function bloquearBoton(boton, textoCargando) {
    const contenidoOriginal = boton.innerHTML;
    boton.disabled = true;
    boton.setAttribute("aria-busy", "true");
    boton.textContent = textoCargando;
    return function restaurar() {
      boton.disabled = false;
      boton.removeAttribute("aria-busy");
      boton.innerHTML = contenidoOriginal;
    };
  }

  /** Guarda un aviso para mostrarlo en la siguiente página (p. ej. tras redirigir). */
  function guardarAviso(clave, tipo, texto) {
    try {
      sessionStorage.setItem(clave, JSON.stringify({ tipo, texto }));
    } catch (e) {}
  }

  function leerAviso(clave) {
    try {
      const valor = sessionStorage.getItem(clave);
      sessionStorage.removeItem(clave);
      return valor ? JSON.parse(valor) : null;
    } catch (e) {
      return null;
    }
  }

  function guardarDato(clave, valor) {
    try {
      sessionStorage.setItem(clave, valor);
    } catch (e) {}
  }

  function leerDato(clave) {
    try {
      const valor = sessionStorage.getItem(clave);
      sessionStorage.removeItem(clave);
      return valor;
    } catch (e) {
      return null;
    }
  }

  function esperar(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
  }

  return {
    mostrarAviso,
    mostrarErrorApi,
    ocultarAviso,
    marcarCampo,
    limpiarCampos,
    esCorreoValido,
    esClaveValida,
    activarAlternarClave,
    bloquearBoton,
    guardarAviso,
    leerAviso,
    guardarDato,
    leerDato,
    esperar,
  };
})();
