const FtPerfil = document.querySelector("#FtAvatarUsuario")


if (!usuarioActual) {
    console.log("No hay usuario logueado")
    window.location.href = "login.html"; //si no hay usuario logueado lo mandamos al login
}

console.log("Usuario logueado tomado por fotoPerfil.js:", usuarioActual)

function mostrarFtPerfil() {
    if (usuarioActual.datos && usuarioActual.datos.perfil) {
        FtPerfil.src = usuarioActual.datos.perfil
    } else {
        //si no tiene avatar por x le asignamos uno predeterminado
        FtPerfil.src = "../img/avatarH1.svg"
        console.log("Usuario sin avatar guardado, usando avatar por defecto")
    }
}

mostrarFtPerfil()

FtPerfil.addEventListener("click", () => {
    window.location.href = "perfil-usuario.html"
})