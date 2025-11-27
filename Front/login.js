const correoLogin = document.querySelector("#correoLogin")
const passLogin = document.querySelector("#passLogin")
const btnIngresar = document.querySelector("#btnInicioSesion")

BASE_URL = "http://localhost:3000"

async function obtenerUsuarioLogin() {
    const correo = correoLogin.value.trim();

    if (!correo) {
        alert("Ingresa un correo");
        return;
    }

    try {
        // Pedimos al backend el usuario con ese correo
        const respuesta = await fetch(`${BASE_URL}/usuario/${correo}`);

        if (!respuesta.ok) {
            alert("Usuario no encontrado");
            return;
        }

        const usuario = await respuesta.json();
        console.log("Usuario encontrado:", usuario);

        verificarUsuario(usuario);

    } catch (error) {
        console.log("Error en obtenerUsuarioLogin:", error);
        alert("Error al conectar con el servidor");
    }
}

function verificarUsuario(usuarioDelServidor) {

    if (!usuarioDelServidor) {
        alert("Usuario no encontrado");
        return;
    }

    const passIngresada = passLogin.value;

    if (!passIngresada) {
        alert("Ingresa la contraseña");
        return;
    }

    if (usuarioDelServidor.pass === passIngresada) {
        console.log("Login correcto");

        // Guardar usuario en localStorage
        localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioDelServidor));
        console.log(usuarioDelServidor)

        window.location.href = "inicio.html";
    } else {
        alert("Contraseña incorrecta");
    }
}


btnIngresar.addEventListener("click", obtenerUsuarioLogin)