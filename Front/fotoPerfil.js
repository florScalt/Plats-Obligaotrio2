//mostrar foto de perfil del usuario logueado
const FtPerfil = document.querySelector("#FtAvatarUsuario")


if (!usuarioActual) {
    console.log("No hay usuario logueado");
    window.location.href = "login.html";
}

console.log("Usuario logueado tomado por fotoPerfil.js:", usuarioActual)

function mostrarFtPerfil() {
    // Verificar que exista el avatar
    if (usuarioActual.datos && usuarioActual.datos.perfil) {
        FtPerfil.src = usuarioActual.datos.perfil
    } else {
        // Avatar por defecto si no tiene uno guardado
        FtPerfil.src = "../img/avatarH1.svg"
        console.log("Usuario sin avatar guardado, usando avatar por defecto")
    }
}

mostrarFtPerfil()

FtPerfil.addEventListener("click", () => {
    window.location.href = "perfil-usuario.html"
})