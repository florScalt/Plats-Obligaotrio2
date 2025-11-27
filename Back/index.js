const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const Grid = require ("gridfs-stream")

const Usuarios = require("./Usuarios")
const Documentos = require("./Documentos")
const { upload, uploadFile } = require("./upload");


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

//EDITAR USUARIO
app.put("/usuario/editar/:correo", async (req, res) => {
    try {
        const params = req.params.correo
        console.log(params)
        const body = req.body

        //puede editar nombre, carrera o pass. Tambien puede editar docs
        if (!body.datos.nombre || !body.datos.carrera || !body.pass) {
            res.status(400).send("Error al editar usuario")
        }
        const actualizado = await editarUsuario(params.correo, body)
        console.log(actualizado);

        res.json(actualizado)
    } catch (e) {
        console.log(e)
        res.status(400).send("Usuario no encotrado")
    }
})


// CREAR USUARIO
app.post("/registrarse", async (req, res) => {
    try {

        const body = req.body
        console.log(body)
        const correoUsuario = body.correo?.toLowerCase().trim()
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
            res.status(400).send("Falta la carrera que cursa el usuario")
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
        console.log(e);
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

//BUSCAR DOCUMENTO POR CARRERA
app.get("/biblioteca/carrera/:carreraDoc", async (req, res) => {
    try {
        const carreraBusqueda = req.params.carreraDoc
        const docBusqueda = await Documentos.find({ carreraDoc: carreraBusqueda })
        res.json(docBusqueda)
        console.log("Se encontró los docuementos por carrera")
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: e.message })
        console.log("No se ha encontrado los documentos con la carrera seleccionada")
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
app.post("/biblioteca/nuevo-documento", upload.single("archivo"), async (req, res) => {
    try {
        const file = req.file;
        const body = req.body;

        if (!file) {
            return res.status(400).send("Falta el archivo");
        }

        // Subir a GridFS
        const fileId = await uploadFile(file);

        // Crear documento en MongoDB con link al fileId
        const nuevoDoc = {
            nombreDoc: body.nombreDoc,
            carreraDoc: body.carreraDoc,
            tipoDoc: body.tipoDoc,
            creador: body.creador,
            descripcion: body.descripcion,
            archivo: fileId, // guardamos solo el id de GridFS
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

//DESCARGAR ARCHVO POR FILENAME
app.get("/archivo/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) return res.status(404).send("Archivo no encontrado");

    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  } catch (err) {
    res.status(500).send(err.message);
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
        const actualizado = await Usuarios.findOneAndUpdate(correo, nuevoUsuario)
        console.log(actualizado)
        return actualizado
    } catch (e) {
        console.log(e.message)
    }
}

iniciar()

