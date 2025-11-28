const mongoose = require("mongoose")

const usuarioSchema = new mongoose.Schema({
    correo: {type:String, required: true, unique: true},
    pass: {type:String, required: true},
    datos: {
        nombre: {type:String, required: true},
        carrera: {type:String, required: true},
        perfil: {type:String, required: true},
    }
})




module.exports = mongoose.model("Usuarios", usuarioSchema)