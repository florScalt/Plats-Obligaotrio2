const nombre = document.querySelector("#nombre-perfil")
const correo = document.querySelector("#correo-perfil")
const carrera = document.querySelector("#carrera-perfil")
const divDocsUsuario = document.querySelector("#documentosUsuario")
const editarNombre = document.querySelector("#editarNombre")
const editarCarrera = document.querySelector("#editarCarrera")
const editarPass = document.querySelector("#editarPass")
const btnEditarPerfil = document.querySelector("#btnEditarPerfil")
const divEditarUsuario = document.querySelector("#divEditarUsuario")
const divDeleteDocs = document.querySelector("#DeleteDocsUsuario")

const BASE_URL = "http://localhost:3000"

const usuarioActual = JSON.parse(localStorage.getItem("usuarioLogueado")); //lo guardó el login

if (!usuarioActual) {
    window.location.href = "login.html"; // si no está logueado lo manda a login.html
}
console.log("Usuario logueado:", usuarioActual);


async function obtenerDatos() {
    try {
        const respuesta = await fetch(`${BASE_URL}/biblioteca/creador/${usuarioActual._id}`)
        const data = await respuesta.json()
        console.log("data:", data.DocsCreador)

        mostrarDocumentosUsuario(data.DocsCreador)
    } catch {
        console.log("No se pudo obtener los documentos")
    }
}

async function mostrarDocumentosUsuario(arrayDocs) {
    nombre.innerHTML = usuarioActual.datos.nombre
    correo.innerHTML = usuarioActual.correo
    carrera.innerHTML = usuarioActual.datos.carrera

    for (const documento of arrayDocs) {

        const descripcion = documento.descripcion.length > 80
            ? documento.descripcion.substring(0, 80) + "..."
            : documento.descripcion

        divDocsUsuario.innerHTML += `
            <article>
                <h3>${documento.nombreDoc}</h3>
                <p>${descripcion}</p>
                <h5>${documento.carreraDoc}</h5>
                <h5>${documento.tipoDoc}</h5>
                <p>${usuarioActual.datos.nombre}</p>
            </article>`
    }
}

async function obtenerDatosUsuario() {
    try {
        const respuesta = await fetch(`${BASE_URL}/usuario/id/${usuarioActual._id}`)
        const data = await respuesta.json()
        console.log("data:", data)

        mostrarDocumentosUsuario(data.DocsCreador)
    } catch {
        console.log("No se pudo obtener los documentos")
    }
}


async function editarUsuario() {
    const data = {
        nombre: editarNombre.value,
        carrera: editarCarrera.value,
        pass: editarPass.value
    };

    try {
        const respuesta = await fetch(`${BASE_URL}/usuario/editar/${usuarioActual.correo}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const resultado = await respuesta.json();
        console.log("Usuario editado:", resultado);

    } catch (error) {
        console.log("Error al editar:", error);
    }
}





obtenerDatos()

if (divEditarUsuario && divDeleteDocs) {
    btnEditarPerfil.addEventListener("click", editarUsuario)
}
