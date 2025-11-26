const nombre = document.querySelector("#userName")
const correo = document.querySelector("#userEmail")
const carrera = document.querySelector("#userCarrera")

const BASE_URL = "http://localhost:3000"

const usuarioActual = JSON.parse(localStorage.getItem("usuarioLogueado")); //lo guardó el login

    if (!usuarioActual) {
        window.location.href = "login.html"; // si no está logueado lo manda a login.html
    }
    console.log("Usuario logueado:", usuarioActual);


function mostrarDatosUsuario () {
    nombre.innerHTML = usuarioActual.datos.nombre
    correo.innerHTML = usuarioActual.correo
    carrera.innerHTML = usuarioActual.datos.carrera

    //mostrar docs. Para esto tengo que consultar a 


    //buscar documento por creador 

}

/*if (divDocsBiblioteca) {
            divDocsBiblioteca.innerHTML += `
            <article>
                <h3>${documento.nombreDoc}</h3>
                <p>${descripcion}</p>
                <h5>${documento.carreraDoc}</h5>
                <h5>${documento.tipoDoc}</h5>
                <p>${nombreCreador}</p>
            </article>`*/

mostrarDatosUsuario()