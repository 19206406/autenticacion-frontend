const formularioRegistro = document.getElementById("formulario-registro");
const avisoRegistro = document.getElementById("aviso-registro");
const nombreCampo = document.getElementById("nombre-registro");
const correoCampo = document.getElementById("correo-registro");
const claveCampo = document.getElementById("clave-registro");
const confirmarCampo = document.getElementById("confirmar-registro");
const botonRegistrar = formularioRegistro.querySelector(
  "button[type='submit']",
);

const TIEMPO_ANTES_DE_REDIRIGIR_MS = 1500;

Utils.activarAlternarClave();

function actualizarReglasClave() {
  const clave = claveCampo.value;
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

claveCampo.addEventListener("input", actualizarReglasClave);

for (const campo of [nombreCampo, correoCampo, claveCampo, confirmarCampo]) {
  campo.addEventListener("input", () => Utils.marcarCampo(campo, ""));
}

function validarFormulario({ nombre, correo, clave, confirmacion }) {
  const errores = [
    [
      nombreCampo,
      nombre === ""
        ? "Escribe tu nombre completo."
        : nombre.length > 100
          ? "El nombre no puede superar 100 caracteres."
          : "",
    ],
    [
      correoCampo,
      correo === ""
        ? "Escribe tu correo electrónico."
        : !Utils.esCorreoValido(correo)
          ? "El correo no tiene un formato válido."
          : "",
    ],
    [
      claveCampo,
      clave === ""
        ? "Escribe una contraseña."
        : !Utils.esClaveValida(clave)
          ? "Necesita mínimo 8 caracteres, una mayúscula y un número."
          : new TextEncoder().encode(clave).length > 72
            ? "La contraseña es demasiado larga."
            : "",
    ],
    [
      confirmarCampo,
      confirmacion === ""
        ? "Confirma tu contraseña."
        : confirmacion !== clave
          ? "La contraseña y su confirmación no coinciden."
          : "",
    ],
  ];

  let primerError = null;
  for (const [campo, mensaje] of errores) {
    Utils.marcarCampo(campo, mensaje);
    if (mensaje && !primerError) primerError = campo;
  }
  return primerError;
}

function marcarErrorDelServidor(error) {
  const mensaje = error.message.toLowerCase();
  if (error.status === 409 || mensaje.includes("correo")) {
    Utils.marcarCampo(correoCampo, error.message);
    correoCampo.focus();
  } else if (mensaje.includes("confirm") || mensaje.includes("coinciden")) {
    Utils.marcarCampo(confirmarCampo, error.message);
    confirmarCampo.focus();
  } else if (mensaje.includes("contraseña")) {
    Utils.marcarCampo(claveCampo, error.message);
    claveCampo.focus();
  } else if (mensaje.includes("nombre")) {
    Utils.marcarCampo(nombreCampo, error.message);
    nombreCampo.focus();
  }
}

formularioRegistro.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  Utils.ocultarAviso(avisoRegistro);

  const datos = {
    nombre: nombreCampo.value.trim().replace(/\s+/g, " "),
    correo: correoCampo.value.trim().toLowerCase(),
    clave: claveCampo.value,
    confirmacion: confirmarCampo.value,
  };

  const campoConError = validarFormulario(datos);
  if (campoConError) {
    Utils.mostrarAviso(
      avisoRegistro,
      "error",
      "Revisa los campos marcados.",
      "Faltan datos",
    );
    campoConError.focus();
    return;
  }

  const restaurarBoton = Utils.bloquearBoton(botonRegistrar, "CREANDO CUENTA…");

  let respuesta;
  try {
    respuesta = await Api.registrar({
      fullName: datos.nombre,
      email: datos.correo,
      password: datos.clave,
      confirmPassword: datos.confirmacion,
    });
  } catch (error) {
    Utils.mostrarErrorApi(avisoRegistro, error, "No pudimos crear tu cuenta");
    marcarErrorDelServidor(error);
    restaurarBoton();
    return;
  }

  const mensaje =
    (respuesta && respuesta.message) || "Usuario registrado correctamente";
  Utils.mostrarAviso(
    avisoRegistro,
    "exito",
    "Te llevamos al inicio de sesión…",
    mensaje,
  );
  Utils.guardarAviso(
    "avisoLogin",
    "exito",
    mensaje + ". Ya puedes iniciar sesión.",
  );
  Utils.guardarDato(
    "correoRegistrado",
    (respuesta && respuesta.user && respuesta.user.email) || datos.correo,
  );
  formularioRegistro.reset();
  actualizarReglasClave();
  botonRegistrar.textContent = "CUENTA CREADA ✓";

  await Utils.esperar(TIEMPO_ANTES_DE_REDIRIGIR_MS);
  window.location.replace(Sesion.PAGINA_LOGIN);
});

Sesion.redirigirSiHaySesion();
Sesion.revalidarAlVolver(Sesion.redirigirSiHaySesion);
