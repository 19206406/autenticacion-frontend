const botonesSalir = document.querySelectorAll("[data-accion='salir']");
const avisoBienvenida = document.getElementById("aviso-bienvenida");

function pintarUsuario(usuario) {
  const iniciales = usuario.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

  document.getElementById("nombre-saludo").textContent = usuario.fullName;
  document.getElementById("nombre-usuario").textContent = usuario.fullName;
  document.getElementById("correo-usuario").textContent = usuario.email;
  document.getElementById("id-usuario").textContent = "#" + usuario.id;
  document.getElementById("iniciales-usuario").textContent = iniciales || "?";
  document.getElementById("hora-ingreso").textContent =
    new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  document.title = "Bienvenido, " + usuario.fullName;
}

async function protegerPagina() {
  const usuario = await Sesion.exigirSesion();
  if (usuario) pintarUsuario(usuario);
}

async function cerrarSesion(evento) {
  const boton = evento.currentTarget;
  Utils.ocultarAviso(avisoBienvenida);
  const restauraciones = [...botonesSalir].map((b) =>
    Utils.bloquearBoton(b, b === boton ? "CERRANDO…" : b.textContent),
  );

  try {
    await Api.cerrarSesion();
  } catch (error) {
    if (error.status !== 401) {
      Utils.mostrarErrorApi(
        avisoBienvenida,
        error,
        "No se pudo cerrar la sesión",
      );
      restauraciones.forEach((restaurar) => restaurar());
      return;
    }
  }

  Sesion.olvidarUsuario();
  Utils.guardarAviso("avisoLogin", "exito", "Sesión cerrada correctamente.");
  window.location.replace(Sesion.PAGINA_LOGIN);
}

botonesSalir.forEach((boton) => boton.addEventListener("click", cerrarSesion));

protegerPagina();
Sesion.revalidarAlVolver(protegerPagina);
