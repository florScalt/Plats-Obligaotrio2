const nombre = document.querySelector("#userName")
const correo = document.querySelector("#userEmail")
const carrera = document.querySelector("#userCarrera")

const BASE_URL = "http://localhost:3000"

const usuario = JSON.parse(localStorage.getItem("usuarioLogueado")); //lo guardó el login

    if (!usuario) {
        window.location.href = "login.html"; // si no está logueado lo manda a login.html
    }
    console.log("Usuario logueado:", usuario);


function mostrarDatosUsuario () {
    nombre.innerHTML = usuario.datos.nombre
    correo.innerHTML = usuario.correo
    carrera.innerHTML = usuario.datos.carrera
}

mostrarDatosUsuario()