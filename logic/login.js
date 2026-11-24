const formularioIngreso = document.getElementById("formulario-ingreso");
const avisoIngreso = document.getElementById("aviso-ingreso");

const mensajeExito = Utils.leerMensaje("mensajeLogin");
if (mensajeExito) Utils.mostrarAviso(avisoIngreso, mensajeExito, true);

const correoRegistrado = Utils.leerMensaje("correoRegistrado");
if (correoRegistrado)
  document.getElementById("correo-ingreso").value = correoRegistrado;

Utils.activarAlternarClave();

formularioIngreso.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  Utils.ocultarAviso(avisoIngreso);

  const correo = document
    .getElementById("correo-ingreso")
    .value.trim()
    .toLowerCase();
  const clave = document.getElementById("clave-ingreso").value;

  if (!Utils.esCorreoValido(correo) || clave === "") {
    Utils.mostrarAviso(avisoIngreso, "Correo o contraseña inválidos.");
    return;
  }

  const botonEnviar = formularioIngreso.querySelector("button[type='submit']");
  try {
    botonEnviar.disabled = true;
    await ApiAuth.iniciarSesion({ email: correo, password: clave });
    window.location.replace(Sesion.PAGINA_BIENVENIDA);
  } catch (error) {
    Utils.mostrarAviso(avisoIngreso, error.message);
    botonEnviar.disabled = false;
  }
});

Sesion.redirigirSiHaySesion();
Sesion.revalidarAlVolver(Sesion.redirigirSiHaySesion);
