const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const Grid = require ("gridfs-stream")

const Usuarios = require("./Usuarios")
const Documentos = require("./Documentos")
const { upload, uploadFile, downloadFile } = require("./upload");

//concecta GridFS y le dice que lo va a guardar en uploads
mongoose.connection.once("open", () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Hola Mundo")
})


//----------------------------------- ENPOINTS --------------------------------------


//------------------ USUARIOS-------------------

//EDITAR USUARIO
app.put("/usuario/editar/:correo", async (req, res) => {
    try {
        const correo = req.params.correo
        const body = { ...req.body } //los ... hacen una copia del body. Es para que como ya hay datos en el html, no edite el usuario y deje vacíos los datos que no se modifican

        console.log("Correo a editar:", correo)
        console.log("Body recibido:", body)

        const actualizado = await editarUsuario(correo, body);

        if (!actualizado) {
            res.status(404).send("Usuario no encontrado")
            return
        }

        res.json(actualizado)

    } catch (e) {
        console.log(e)
        res.status(500).send("Error al editar usuario")
    }
})


// CREAR USUARIO
app.post("/registrarse", async (req, res) => {
    try {

        const body = req.body
        console.log(body)
        const correoUsuario = body.correo?.toLowerCase().trim() //el ? es para que de undefined y no rompa el código
        const passUsuario = body.pass
        const nombreUsuario = body.datos.nombre
        const carreraUsuario = body.datos.carrera
        const fotoPerfil = body.datos.perfil


        if (!correoUsuario) {
            res.status(400).send("Falta el correo electrónico")
            return
        }
        if (!passUsuario) {
            res.status(400).send("Falta la contraseña")
            return
        }
        if (!nombreUsuario) {
            res.status(400).send("Falta el nombre")
            return
        }
        if (!carreraUsuario) {
            res.status(400).send("Falta la carrera")
            return
        }
        if (!fotoPerfil) {
            res.status(400).send("Falta elegir una foto de perfil")
            return
        }

        console.log("usuario recibido", correoUsuario)
        const usuarioExistente = await buscarUsuarioPorCorreo(correoUsuario)
        console.log("Buscando usuario existente")

        if (!usuarioExistente) {

            crearUsuario({
                correo: correoUsuario,
                pass: passUsuario,
                datos: {
                    nombre: nombreUsuario,
                    carrera: carreraUsuario,
                    perfil: fotoPerfil,
                },
            })
            res.status(200).send("Usuario creado con éxito")
            console.log("El usuario existente", usuarioExistente)
            return

        } else {
            res.status(400).send("Este correo ya está registrado prueba con otro")
            return
        }

    } catch (e) {
        console.log(e)
    }
})


//BUSCAR USUARIO POR CORREO
app.get("/usuario/:correo", async (req, res) => {
    try {
        const params = req.params
        const correoBusqueda = params.correo
        const usuarioBusqueda = await Usuarios.findOne({ correo: correoBusqueda })
        res.json(usuarioBusqueda)
        console.log("Se encontró el usuario exitosamente")
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: e.message })
        console.log("No se ha encontrado el usuario")
    }
})

//BUSCAR USUARIO POR ID
app.get("/usuario/id/:idUsuario", async (req, res) => {
    try {
        const idBusqueda = req.params.idUsuario
        const usuarioBusqueda = await Usuarios.findById(idBusqueda)
        res.json(usuarioBusqueda)
        console.log("usuario busqueda:", usuarioBusqueda)
        console.log("Se encontró el usuario exitosamente por id")
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: e.message })
        console.log("No se ha encontrado el usuario")
    }
})






//------------------ DOCUMENTOS -------------------
//BUSCAR DOCUMENTO POR CARRERA
app.get("/biblioteca/carrera/:carreraDoc", async (req, res) => {
    try {
        const carreraBusqueda = req.params.carreraDoc
        const docBusqueda = await Documentos.find({ carreraDoc: carreraBusqueda })
        res.json(docBusqueda)
        console.log("Se encontraron", docBusqueda.length, "documentos")
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: e.message })
    }
})

//BUSCAR DOCUMENTO POR NOMBRE
app.get("/biblioteca/nombre/:nombreDoc", async (req, res) => {
    try {
        const nombre = req.params.nombreDoc

        const documentos = await Documentos.find({
            nombreDoc: { $regex: nombre, $options: "i" } //el $regex es para búsquedas parciales. ej. que busque solo "resumen" y aparezcan todos los docs que contanegan "resumen", no solo que busque literalmente.
            //el $options: "i" hace referencia a ignorar las mayúsculas y minúsculas
        });

        res.json({ documentos });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

//BUSCAR DOCUMENTO POR ID
app.get("/biblioteca/:id", async (req, res) => {
    try {
        const docId = req.params.id
        const documento = await Documentos.findById(docId)
        
        if (!documento) {
            res.status(404).json({ message: "Documento no encontrado" })
            return
        }

        console.log("Documento encontrado:", documento.nombreDoc)
        res.json(documento)
        
    } catch (e) {
        console.log("Error al buscar documento:", e.message)
        res.status(500).json({ message: "Error al buscar el documento" })
    }
});


//BUSCAR DOCUMENTO POR CREADOR
app.get("/biblioteca/creador/:id", async (req, res) => {
    try {
        const idCreador = req.params.id
        const DocsCreador = await Documentos.find({creador: idCreador })

        res.json({ DocsCreador });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})



//SUBIR DOCUMENTOS
app.post("/biblioteca/nuevo-documento", upload.single("archivo"), async (req, res) => { //el upload.single es Multer buscando el archivo
    try {
        const file = req.file;
        const body = req.body;

        if (!file) {
            return res.status(400).send("Falta el archivo")
        }
        const fileId = await uploadFile(file) //para subir a GridFS

        const nuevoDoc = {
            nombreDoc: body.nombreDoc,
            carreraDoc: body.carreraDoc,
            tipoDoc: body.tipoDoc,
            creador: body.creador,
            descripcion: body.descripcion,
            archivo: fileId, //se guarda el id de GridFS
        };

        await Documentos.create(nuevoDoc);

        res.status(200).send("Documento creado con éxito");
    } catch (e) {
        console.log(e);
        res.status(500).send("Error al subir documento");
    }
})



//MOSTRAR TODOS LOS DOCUMENTOS
app.get("/biblioteca", async (req, res) => {
    try {
        const Docs = await Documentos.find().limit(50).sort({ nombre: 1 })
        const respuesta = {
            documentos: Docs,
            count: Docs.length,
            message: "Documentos obtenidos con exito"
        }
        res.json(respuesta)
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: error.message })
    }

})

//ELIMINAR DOCUMENTOS
app.delete("/biblioteca/eliminar/:id", async (req, res) => {
    try {
        const params = req.params
        console.log(params)
        await Documentos.findByIdAndDelete(params.id)
        res.send("Documento eliminado con éxito")
    } catch (e) {
        console.log(e)
        res.status(400).send("Documento no encotrado")
    }
})


//DESCARGAR ARCHIVOS POR ID
app.get("/biblioteca/descargar/:id", async (req, res) => {
    try {
        const docId = req.params.id;
        const documento = await Documentos.findById(docId);
        
        if (!documento) {
            return res.status(404).send("Documento no encontrado")
        }

        const fileData = await downloadFile(documento.archivo); //acá descarga el archivo de GridFS
        
        if (!fileData) {
            return res.status(404).send("Archivo no encontrado en GridFS")
        }

        const encodedFilename = encodeURIComponent(fileData.filename); //puse el encodeURI por que a veces los nombres de los docs que se suben no son compatibles

        // Esto es de GridFS para configurar el nombre de descarga (configura los HTTP para que la compu sepa como descargarlo):
        res.set({
            'Content-Type': fileData.contentType,
            'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        })

        //sobre conextion GridFS y chrome
        fileData.stream.pipe(res);
        fileData.stream.on('end', () => {
            fileData.closeConnection();
        })
        fileData.stream.on('error', (error) => {
            console.error("Error al descargar:", error);
            fileData.closeConnection();
            res.status(500).send("Error al descargar el archivo");
        })

    } catch (e) {
        console.log("Error en descarga:", e);
        res.status(500).send("Error al procesar la descarga");
    }
});






//----------------------------------- FUNCIONES --------------------------------------
async function iniciar() {
    try {
        await mongoose.connect("mongodb+srv://avril:AdatabaseORT2026@cluster0.rznkvjp.mongodb.net/")
        console.log("Conectados con la DB :)")

        app.listen(PORT, () => {
            console.log("Escuchando el puerto " + PORT)
        })


    } catch (e) {
        console.log("Error conectando a la db ", e.message);
    }
}


async function crearUsuario(datosUsuario) {
    try {
        const usuario = await Usuarios.create(datosUsuario)
        console.log(usuario);
    } catch (error) {
        console.log(error.message)
    }
}

async function buscarUsuarioPorCorreo(correoElectronico) {

    console.log("buscando en DB", correoElectronico)
    console.log(Usuarios)
    const usuario = await Usuarios.findOne({ correo: correoElectronico })
    console.log(usuario)
    console.log("Resultado DB:", usuario)
    return usuario
}

async function crearDocumento(datosDoc) {
    try {
        const documento = await Documentos.create(datosDoc)
        console.log(documento);
    } catch (error) {
        console.log(error.message)
    }
}



async function editarUsuario(correo, nuevoUsuario) {
    try {
        const actualizado = await Usuarios.findOneAndUpdate(
            { correo: correo },     // filtro correcto
            { $set: nuevoUsuario }, // actualizar campos
            { new: true }           // devuelve el objeto actualizado
        );

        return actualizado;

    } catch (e) {
        console.log("Error en editarUsuario:", e.message);
        return;
    }
}

iniciar()

