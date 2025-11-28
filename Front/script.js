//IMPORTAR JS DEL HEADER Y FOOTER

//ELEMENTOS DEL HTML
const nombreNuevoDoc = document.querySelector("#nombreDoc");
const carreraNuevoDoc = document.querySelector("#carreraDoc");
const tipoResumen = document.querySelector("#opcionResumen");
const tipoDocumento = document.querySelector("#opcionDocumento");
const descNuevoDoc = document.querySelector("#descripcionDoc");
const btnSubirDoc = document.querySelector("#subirDocBtn");
const inputArchivo = document.querySelector("#archivoDoc");
const dropZone = document.querySelector(".drop-zone");
const divAgregarDoc = document.querySelector("#agregarDoc");
const contenedorDocs = document.querySelector("#contenedorArticulos");
const divDocsBiblioteca = document.querySelector("#contenedorDocsBiblioteca")
const carreraSelect = document.querySelector("#carreraSelect")
const buscadorDoc = document.querySelector("#inputSearch")



//USUARIO ACTUAL
const usuarioActual = JSON.parse(localStorage.getItem("usuarioLogueado")); //lo guardó el login
    if (!usuarioActual) {
        window.location.href = "login.html"; // si no está logueado lo manda a login.html
    }
    console.log("Usuario logueado:", usuarioActual);


//ELEMENTOS DE LA API
const BASE_URL = "http://localhost:3000"

//MOSTRAR LOS DOCOCUMENTOS EN INCIO Y BIBLIOTECA
async function obtenerDocumentos() {
    try {
        const respuesta = await fetch(`${BASE_URL}/biblioteca`)
        const data = await respuesta.json()

        mostrarDocumentos(data.documentos)
    } catch {
        console.log("No se pudo obtener los documentos")
    }
}
async function mostrarDocumentos(arrayDocumentos) {
    //para ver en qué html estoy: no se puede usar una misma función en html que no estoy viendo activamente
    if (contenedorDocs) contenedorDocs.innerHTML = ""
    if (divDocsBiblioteca) divDocsBiblioteca.innerHTML = ""

    for (const documento of arrayDocumentos) {

        const descripcion = documento.descripcion.length > 80
            ? documento.descripcion.substring(0, 80) + "..."
            : documento.descripcion

        const respuestaUsuario = await fetch(`${BASE_URL}/usuario/id/${documento.creador}`)
        console.log("id creador del doc:", documento.creador)
        const usuario = await respuestaUsuario.json()
        console.log(usuario)

        const nombreCreador = usuario.datos.nombre

        // Si estoy en inicio.html
        if (contenedorDocs) {
            const cantidadArticles = contenedorDocs.querySelectorAll("article").length;

            if (cantidadArticles >= 4) { //para que solo muestre 4 articles en el inicio
                return
            }
            contenedorDocs.innerHTML += `
            <article>
                <h3>${documento.nombreDoc}</h3>
                <p>${descripcion}</p>
                <h5>${documento.carreraDoc}</h5>
                <p>${nombreCreador}</p>
            </article>`

        }

        // Si estoy en biblioteca.html
        if (divDocsBiblioteca) {
            divDocsBiblioteca.innerHTML += `
            <article>
                <h3>${documento.nombreDoc}</h3>
                <p>${descripcion}</p>
                <div class="infodoc">
                    <h5>${documento.carreraDoc}</h5>
                    <h5 class="badge ${documento.tipoDoc === "Resumen" ? "resumen" : "documento"}">${documento.tipoDoc}</h5> 
                 </div>
                <p>${nombreCreador}</p>
            </article>`
        }
    }
}

//FILTRAR DOCS POR CARRERA
//FILTRAR DOCS POR CARRERA
async function filtarPorCarrera() {
    const carrera = carreraSelect.value;

    console.log("Carrera seleccionada:", carrera);

    if (!carrera) {
        obtenerDocumentos(); // Si no hay selección, mostrar todos
        return;
    }

    try {
        const carreraEncoded = encodeURIComponent(carrera);
        const respuesta = await fetch(`${BASE_URL}/biblioteca/carrera/${carreraEncoded}`);
        
        if (!respuesta.ok) {
            throw new Error("Error en la respuesta");
        }

        const data = await respuesta.json();
        console.log("Datos recibidos:", data);

        if (data.length > 0) {
            mostrarDocumentos(data);
        } else {
            if (divDocsBiblioteca) {
                divDocsBiblioteca.innerHTML = `<h3>No hay documentos relacionados a tu búsqueda</h3>`;
            }
        }
    } catch (error) {
        console.error("Error al filtrar por carrera:", error);
        if (divDocsBiblioteca) {
            divDocsBiblioteca.innerHTML = `<h3>No hay documentos relacionados a tu búsqueda</h3>`;
        }
    }
}

//FILTRAR POR NOMBRE DEL DOC
async function filtrarPorNombre() {
    const nombre = buscadorDoc.value.trim();

    if (nombre === "") {
        obtenerDocumentos(); // por si el usuario borra en la búsqueda, que devuelva todos los docs
        return;
    }

    const res = await fetch(`${BASE_URL}/biblioteca/nombre/${encodeURIComponent(nombre)}`);
    const data = await res.json();

    if (data.documentos.length > 0) {
        mostrarDocumentos(data.documentos);
    } else {
        divDocsBiblioteca.innerHTML = "<h3>No hay documentos con ese nombre</h3>";
    }
}


//DRAG AND DROP EN NUEVO-DOCUMENTO.HTML
if (dropZone && inputArchivo) {
    // Click en la zona para abrir selector
    dropZone.addEventListener("click", () => {
        inputArchivo.click();
    });

    // Prevenir comportamiento por defecto
    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    // Manejar el drop
    dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            inputArchivo.files = files;
        }
    });
}

// AGREGAR DOCUMENTO EN NUEVO-DOCUMENTO.HTML
async function crearDocumento() {
    const tipo =
        tipoResumen.checked ? "Resumen" :
        tipoDocumento.checked ? "Documento" :
        "";

    const archivo = inputArchivo.files[0];

    if (!nombreNuevoDoc.value.trim()) {
        alert("Debes ingresar un nombre para el documento");
        return;
    }

    if (!carreraNuevoDoc.value) {
        alert("Debes seleccionar una carrera");
        return;
    }

    if (!descNuevoDoc.value.trim()) {
        alert("Debes ingresar una descripción");
        return;
    }

    if (!archivo) {
        alert("Debes seleccionar un archivo PDF");
        return;
    }

    const usuarioActual = JSON.parse(localStorage.getItem("usuarioLogueado"));

    if (!usuarioActual) {
        alert("No hay usuario logueado");
        window.location.href = "login.html";
        return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombreDoc", nombreNuevoDoc.value.trim());
    formData.append("carreraDoc", carreraNuevoDoc.value);
    formData.append("tipoDoc", tipo);
    formData.append("creador", usuarioActual._id);
    formData.append("descripcion", descNuevoDoc.value.trim());

    btnSubirDoc.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/biblioteca/nuevo-documento`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Documento subido con éxito");
            window.location.href = "biblioteca.html";
        } else {
            alert("Error al subir el documento");
            btnSubirDoc.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert("Error en la conexión con el servidor");
        btnSubirDoc.disabled = false;
    }
}





if(contenedorDocs || divDocsBiblioteca){ //si estoy en incio.html o biblioteca.html
    obtenerDocumentos()
}


if(carreraSelect && buscadorDoc){ //para ver si estoy en biblioteca.html
    carreraSelect.addEventListener("change", filtarPorCarrera)
    buscadorDoc.addEventListener("keyup", filtrarPorNombre)
}

if(btnSubirDoc){ //para saber si estamos parados en nuevo-documento.html
    btnSubirDoc.addEventListener("click", crearDocumento)
}

