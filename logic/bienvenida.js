const botonSalir = document.getElementById("boton-salir");
const avisoBienvenida = document.getElementById("aviso-bienvenida");

async function protegerPagina() {
  const usuario = await Sesion.exigirSesion();
  if (!usuario) return;

  document.getElementById("saludo-usuario").textContent =
    "Bienvenido, " + usuario.fullName + ".";
  document.getElementById("nombre-usuario").textContent = usuario.fullName;
  document.getElementById("correo-usuario").textContent = usuario.email;
}

botonSalir.addEventListener("click", async function () {
  botonSalir.disabled = true;
  Utils.ocultarAviso(avisoBienvenida);

  try {
    await ApiAuth.cerrarSesion();
  } catch (error) {
    Utils.mostrarAviso(avisoBienvenida, error.message);
    botonSalir.disabled = false;
    return;
  }

  Utils.guardarMensaje("mensajeLogin", "Sesión cerrada correctamente.");
  window.location.replace(Sesion.PAGINA_LOGIN);
});

protegerPagina();
Sesion.revalidarAlVolver(protegerPagina);
