//mostrar foto de perfil del usuario logueado
const FtPerfil = document.querySelector("#FtAvatarUsuario")

console.log("Usuario logueado tomado por fotoPerfil.js:", usuarioActual)


function mostrarFtPerfil() {
    FtPerfil.src = usuarioActual.datos.perfil
}

mostrarFtPerfil()

FtPerfil.addEventListener("click", () => {
    window.location.href = "perfil-usuario.html"
})
