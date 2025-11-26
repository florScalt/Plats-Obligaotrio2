//Header login y registro//
document.addEventListener("DOMContentLoaded", () => {
    const header = `
        <header>
            <a href="#" class="logo">
                <img src="../img/logoPlats.svg" alt="PLATS logo">
                PLATS
            </a>
            <nav>
                <a href="">
                <span class="material-symbols-outlined">headset_mic</span>Ayuda</a>
                <a href="">Contactanos</a>
            </nav>
        </header>
    `;
    
    document.body.insertAdjacentHTML("afterbegin", header);
});

//mostrar foto de perfil del usuario logueado
const FtPerfil = document.querySelector("#FtAvatarUsuario")

const usuarioActual = JSON.parse(localStorage.getItem("usuarioLogueado"))
    if (!usuarioActual) {
        window.location.href = "login.html" 
    }
    console.log("Usuario logueado:", usuarioActual)

function mostrarFtPerfil () {
    FtPerfil.innerHTML = usuarioActual.datos.perfil
}

FtPerfil.addEventListener("click", () => {
    window.location.href = "perfil-usuario.html"
})