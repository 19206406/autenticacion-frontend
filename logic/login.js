const formularioIngreso = document.getElementById("formulario-ingreso");
const avisoIngreso = document.getElementById("aviso-ingreso");
const campoCorreo = document.getElementById("correo-ingreso");
const campoClave = document.getElementById("clave-ingreso");
const botonIngresar = formularioIngreso.querySelector("button[type='submit']");

const TIEMPO_ANTES_DE_REDIRIGIR_MS = 1200;

// Aviso que dejó otra página (registro exitoso, sesión cerrada, sesión expirada...).
const avisoPendiente = Utils.leerAviso("avisoLogin");
if (avisoPendiente) Utils.mostrarAviso(avisoIngreso, avisoPendiente.tipo, avisoPendiente.texto);

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

  // 1. Validación en el cliente (el servidor vuelve a validar).
  const campoConError = validarFormulario(correo, clave);
  if (campoConError) {
    Utils.mostrarAviso(avisoIngreso, "error", "Revisa los campos marcados.", "Faltan datos");
    campoConError.focus();
    return;
  }

  const restaurarBoton = Utils.bloquearBoton(botonIngresar, "VERIFICANDO…");

  // 2. Petición de login.
  let respuesta;
  try {
    respuesta = await Api.iniciarSesion({ email: correo, password: clave });
  } catch (error) {
    if (error.status === 401) {
      // Mensaje genérico del backend: "Correo o contraseña inválidos".
      Utils.mostrarErrorApi(avisoIngreso, error, "No pudimos iniciar sesión");
      campoClave.value = "";
      campoClave.focus();
    } else {
      Utils.mostrarErrorApi(avisoIngreso, error);
    }
    restaurarBoton();
    return;
  }

  // 3. Se confirma que la sesión quedó creada antes de redirigir.
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

  // 4. Todo salió bien: se informa y luego se redirige.
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

// Al escribir se limpia el error del campo correspondiente.
for (const campo of [campoCorreo, campoClave]) {
  campo.addEventListener("input", () => Utils.marcarCampo(campo, ""));
}

Sesion.redirigirSiHaySesion();
Sesion.revalidarAlVolver(Sesion.redirigirSiHaySesion);
