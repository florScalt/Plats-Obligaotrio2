//elementos de de perfil-usuario.html
const divDocsUsuario = document.querySelector("#documentosUsuario")

//elementos de editar-usuario.html
const editarNombre = document.querySelector("#editarNombre")
const editarCarrera = document.querySelector("#editarCarrera")
const editarPass = document.querySelector("#editarPass")
const btnEditarPerfil = document.querySelector("#btnEditarPerfil")
const divEditarUsuario = document.querySelector("#divEditarUsuario")
const divDeleteDocs = document.querySelector("#DeleteDocsUsuario")
const contenedorAvatares = document.querySelector(".avatares")

const nombrePerfil = document.querySelector("#nombre-perfil")
const correoPerfil = document.querySelector("#correo-perfil")
const carreraPerfil = document.querySelector("#carrera-perfil")
const ftPerfil = document.querySelector("#ftPerfil")
const btnCerrarSesion = document.querySelector("#btnCerrarSesion")

const BASE_URL = "http://localhost:3000"

const avatares = [
    "../img/avatarH1.svg",
    "../img/avatarH2.svg",
    "../img/avatarM1.svg",
    "../img/avatarM2.svg"
];

const arrayCarreras = [
    "Licenciatura en Comunicación",
    "Licenciatura en Diseño Multimedia",
    "Licenciatura en Ingeniería en Sistemas",
    "Licenciatura en Gerencia y Administración",
    "Licenciatura en Animación y Videojuegos",
    "Licenciatura en Estudios Internacionales",
    "Licenciatura en Biotecnología"
];

let avatarSeleccionado
let usuarioActual 

try {
    const usuarioGuardado = localStorage.getItem("usuarioLogueado")
    
    if (!usuarioGuardado) {
        console.log("No hay usuario en localStorage")
        window.location.href = "login.html"
    } else {
        usuarioActual = JSON.parse(usuarioGuardado) //vuelve a convertir el string en un json
        console.log("Usuario logueado:", usuarioActual)
    }
} catch (error) {
    console.error("Error al parsear usuario:", error)
    localStorage.removeItem("usuarioLogueado")
    window.location.href = "login.html"
}

// CERRAR SESIÓN
function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem("usuarioLogueado"); //borra el usuario logueado del localStorage
        window.location.href = "login.html";
    }
}

function mostrarInfoPerfil() {
    if (nombrePerfil && usuarioActual.datos.nombre) {
        nombrePerfil.innerHTML = usuarioActual.datos.nombre
    }
    if (correoPerfil && usuarioActual.correo) {
        correoPerfil.innerHTML = usuarioActual.correo
    }
    if (carreraPerfil && usuarioActual.datos.carrera) {
        carreraPerfil.innerHTML = usuarioActual.datos.carrera
    }
    
    if (ftPerfil && usuarioActual.datos.perfil) {
        ftPerfil.innerHTML = `<img src="${usuarioActual.datos.perfil}" alt="Avatar" class="avatarPerfil">`
    }
}

async function obtenerDocumentosUsuario() {
    try {
        const respuesta = await fetch(`${BASE_URL}/biblioteca/creador/${usuarioActual._id}`)
        const data = await respuesta.json()
        console.log("Documentos del usuario:", data)

        mostrarDocumentosUsuario(data.DocsCreador)
    } catch (error) {
        console.log("No se pudo obtener los documentos:", error)
    }
}

function mostrarDocumentosUsuario(arrayDocs) {
    const contenedor = divDocsUsuario || divDeleteDocs;
    
    if (!contenedor) return;
    contenedor.innerHTML = ""

    if (arrayDocs.length === 0) {
        contenedor.innerHTML = "<p>No has subido documentos todavía</p>"
        return
    }
    
    for (const documento of arrayDocs) {
        const descripcion = documento.descripcion.length > 80
            ? documento.descripcion.substring(0, 80) + "..."
            : documento.descripcion

        const botonEliminar = divDeleteDocs ? 
            `<div class="btnEliminarDoc" onclick="eliminarDocumento('${documento._id}')" title="Eliminar documento">
                <img src= "img/trash.svg">
                </div>` : '';

        contenedor.innerHTML += `
            <article>
                <h3>${documento.nombreDoc}</h3>
                <p>${descripcion}</p>
                <h5>${documento.carreraDoc}</h5>
                <h5>${documento.tipoDoc}</h5>
                <p>${usuarioActual.datos.nombre}</p>
                <div class="cajita">
                ${botonEliminar}
                </div>
            </article>`
    }
}

async function eliminarDocumento(idDocumento) {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?")) 
        return

    try {
        const respuesta = await fetch(`${BASE_URL}/biblioteca/eliminar/${idDocumento}`, {
            method: "DELETE"
        })

        if (respuesta.ok) {
            alert("Documento eliminado correctamente")
            obtenerDocumentosUsuario()
        } else {
            alert("Error al eliminar el documento")
        }
    } catch (error) {
        console.log("Error al eliminar documento:", error)
        alert("Error en la conexión con el servidor")
    }
}

window.eliminarDocumento = eliminarDocumento;

function cargarAvatares() {
    if (!contenedorAvatares) 
        return

    contenedorAvatares.innerHTML = ""

    avatares.forEach(url => {
        const img = document.createElement("img")
        img.src = url;
        img.classList.add("avatarIcon");

        if (usuarioActual.datos.perfil === url) {
            img.classList.add("selected");
            avatarSeleccionado = url
        }

        img.addEventListener("click", () => {
            avatarSeleccionado = url

            document.querySelectorAll(".avatarIcon").forEach(a => 
                a.classList.remove("selected")
            );

            img.classList.add("selected")
        });

        contenedorAvatares.appendChild(img)
    });
}

function cargarCarreras() {
    if (!editarCarrera) return

    editarCarrera.innerHTML = '<option value="" disabled>Carrera que estudias</option>'

    arrayCarreras.forEach(carrera => {
        const option = document.createElement("option")
        option.value = carrera
        option.textContent = carrera
        editarCarrera.appendChild(option)
    });
}

function cargarDatosEdicion() {
    cargarCarreras()

    if (editarNombre) editarNombre.value = usuarioActual.datos.nombre
    if (editarCarrera) editarCarrera.value = usuarioActual.datos.carrera
    if (editarPass) editarPass.value = ""

    cargarAvatares()
}

async function guardarCambios() {
    try {
        const body = {
            datos: {
                nombre: editarNombre.value,
                carrera: editarCarrera.value,
                perfil: avatarSeleccionado || usuarioActual.datos.perfil
            }
        }

        if (editarPass.value.trim() !== "") {
            body.pass = editarPass.value
        }

        const respuesta = await fetch(`${BASE_URL}/usuario/editar/${usuarioActual.correo}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        })

        if (respuesta.ok) {
            const data = await respuesta.json()
            console.log("Cambios guardados:", data)

            usuarioActual.datos.nombre = editarNombre.value
            usuarioActual.datos.carrera = editarCarrera.value
            usuarioActual.datos.perfil = avatarSeleccionado || usuarioActual.datos.perfil
            if (editarPass.value.trim() !== "") {
                usuarioActual.pass = editarPass.value
            }
            localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioActual))

            alert("Perfil actualizado correctamente")
            window.location.href = "perfil-usuario.html"
        } else {
            const errorText = await respuesta.text()
            alert("Error al guardar cambios: " + errorText)
        }

    } catch (error) {
        console.log("Error al guardar cambios:", error)
        alert("Hubo un error al guardar los cambios")
    }
}

// ejecutar según la página
if (divDocsUsuario) {
    mostrarInfoPerfil()
    obtenerDocumentosUsuario()
    
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", cerrarSesion)
    }
}

if (divEditarUsuario || divDeleteDocs) {
    cargarDatosEdicion()
    obtenerDocumentosUsuario()
    
    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener("click", guardarCambios)
    }
}