const formularioRegistro = document.getElementById("formulario-registro");
const avisoRegistro = document.getElementById("aviso-registro");
const campoClaveRegistro = document.getElementById("clave-registro");

Utils.activarAlternarClave();

function actualizarReglasClave() {
  const clave = campoClaveRegistro.value;
  document
    .getElementById("regla-longitud")
    .classList.toggle("cumplida", clave.length >= 8);
  document
    .getElementById("regla-mayuscula")
    .classList.toggle("cumplida", /[A-Z]/.test(clave));
  document
    .getElementById("regla-numero")
    .classList.toggle("cumplida", /[0-9]/.test(clave));
}

campoClaveRegistro.addEventListener("input", actualizarReglasClave);

formularioRegistro.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  Utils.ocultarAviso(avisoRegistro);

  const nombreCampo = document.getElementById("nombre-registro");
  const correoCampo = document.getElementById("correo-registro");
  const claveCampo = document.getElementById("clave-registro");
  const confirmarCampo = document.getElementById("confirmar-registro");

  const nombre = nombreCampo.value.trim().replace(/\s+/g, " ");
  const correo = correoCampo.value.trim().toLowerCase();
  const clave = claveCampo.value;
  const confirmacion = confirmarCampo.value;

  Utils.marcarCampo(nombreCampo, nombre.length < 3);
  Utils.marcarCampo(correoCampo, !Utils.esCorreoValido(correo));
  Utils.marcarCampo(claveCampo, !Utils.esClaveValida(clave));
  Utils.marcarCampo(
    confirmarCampo,
    confirmacion !== clave || confirmacion === "",
  );

  if (nombre.length < 3) {
    Utils.mostrarAviso(
      avisoRegistro,
      "Escribe tu nombre completo (al menos 3 caracteres).",
    );
    return;
  }

  if (!Utils.esCorreoValido(correo)) {
    Utils.mostrarAviso(avisoRegistro, "Ingresa un correo electrónico válido.");
    return;
  }

  if (!Utils.esClaveValida(clave)) {
    Utils.mostrarAviso(
      avisoRegistro,
      "La contraseña necesita 8 caracteres, una mayúscula y un número.",
    );
    return;
  }

  if (clave !== confirmacion) {
    Utils.mostrarAviso(avisoRegistro, "Las contraseñas no coinciden.");
    return;
  }

  const botonEnviar = formularioRegistro.querySelector("button[type='submit']");
  try {
    botonEnviar.disabled = true;

    await ApiAuth.registrar({
      fullName: nombre,
      email: correo,
      password: clave,
      confirmPassword: confirmacion,
    });

    Utils.guardarMensaje(
      "mensajeLogin",
      "¡Cuenta creada! Ya puedes iniciar sesión.",
    );
    Utils.guardarMensaje("correoRegistrado", correo);
    window.location.href = Sesion.PAGINA_LOGIN;
  } catch (error) {
    if (error.status === 409) Utils.marcarCampo(correoCampo, true);
    Utils.mostrarAviso(avisoRegistro, error.message);
    botonEnviar.disabled = false;
  }
});

Sesion.redirigirSiHaySesion();
Sesion.revalidarAlVolver(Sesion.redirigirSiHaySesion);
