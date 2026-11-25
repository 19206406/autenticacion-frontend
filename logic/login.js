const formularioIngreso = document.getElementById("formulario-ingreso");
const avisoIngreso = document.getElementById("aviso-ingreso");
const campoCorreo = document.getElementById("correo-ingreso");
const campoClave = document.getElementById("clave-ingreso");
const botonIngresar = formularioIngreso.querySelector("button[type='submit']");

const TIEMPO_ANTES_DE_REDIRIGIR_MS = 1200;

const avisoPendiente = Utils.leerAviso("avisoLogin");
if (avisoPendiente)
  Utils.mostrarAviso(avisoIngreso, avisoPendiente.tipo, avisoPendiente.texto);

const correoRegistrado = Utils.leerDato("correoRegistrado");
if (correoRegistrado) {
  campoCorreo.value = correoRegistrado;
  campoClave.focus();
}

Utils.activarAlternarClave();

function validarFormulario(correo, clave) {
  let primerError = null;

  const errorCorreo =
    correo === ""
      ? "Escribe tu correo electrónico."
      : !Utils.esCorreoValido(correo)
        ? "El correo no tiene un formato válido."
        : "";
  const errorClave = clave === "" ? "Escribe tu contraseña." : "";

  Utils.marcarCampo(campoCorreo, errorCorreo);
  Utils.marcarCampo(campoClave, errorClave);

  if (errorCorreo) primerError = primerError || campoCorreo;
  if (errorClave) primerError = primerError || campoClave;
  return primerError;
}

formularioIngreso.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  Utils.ocultarAviso(avisoIngreso);

  const correo = campoCorreo.value.trim().toLowerCase();
  const clave = campoClave.value;

  const campoConError = validarFormulario(correo, clave);
  if (campoConError) {
    Utils.mostrarAviso(
      avisoIngreso,
      "error",
      "Revisa los campos marcados.",
      "Faltan datos",
    );
    campoConError.focus();
    return;
  }

  const restaurarBoton = Utils.bloquearBoton(botonIngresar, "VERIFICANDO…");

  let respuesta;
  try {
    respuesta = await Api.iniciarSesion({ email: correo, password: clave });
  } catch (error) {
    if (error.status === 401) {
      Utils.mostrarErrorApi(avisoIngreso, error, "No pudimos iniciar sesión");
      campoClave.value = "";
      campoClave.focus();
    } else {
      Utils.mostrarErrorApi(avisoIngreso, error);
    }
    restaurarBoton();
    return;
  }

  Sesion.guardarIdUsuario(respuesta.user.id);
  const { usuario, error } = await Sesion.verificar();
  if (!usuario) {
    Utils.mostrarAviso(
      avisoIngreso,
      "error",
      "El servidor aceptó tus credenciales, pero no se pudo confirmar la sesión. " +
        (error ? error.message : "") +
        " Asegúrate de abrir el frontend desde localhost o 127.0.0.1 (no como archivo).",
      "No se pudo crear la sesión",
    );
    restaurarBoton();
    return;
  }

  Utils.mostrarAviso(
    avisoIngreso,
    "exito",
    "Hola, " + usuario.fullName + ". Te llevamos a tu espacio…",
    respuesta.message || "Inicio de sesión exitoso",
  );
  botonIngresar.textContent = "ENTRANDO…";
  await Utils.esperar(TIEMPO_ANTES_DE_REDIRIGIR_MS);
  window.location.replace(Sesion.PAGINA_BIENVENIDA);
});

for (const campo of [campoCorreo, campoClave]) {
  campo.addEventListener("input", () => Utils.marcarCampo(campo, ""));
}

Sesion.redirigirSiHaySesion();
Sesion.revalidarAlVolver(Sesion.redirigirSiHaySesion);
