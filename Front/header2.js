/*HEADER PARA LAS OTRAS PANTALLAS*/

const header = `
    <header>
        <a href="#" class="logo">
            <img src="../img/logoPlats.svg" alt="PLATS logo">
            PLATS
        </a>
        <nav>
            <a href="./inicio.html" class="active">Inicio</a>
            <a href="./biblioteca.html">Biblioteca compartida</a>
            <a href="./nota.html">Notas</a>
            <a href="">Foro</a>
        </nav>
        <div class="avatar-container">
            <img id="FtAvatarUsuario" src="" alt="">
        </div>
    </header>
`;

//FOOTER
const footer = `
    <footer>
            <a href="./inicio.html" class="logoFooter"><img src="../img/whitePlats.svg" alt="PLATS logo"></a>
        <div>
            <p>Obligatorio 2 Programacion 2</p>
            <p>Avril Estefan y Florencia Scaltritti</p>
            <p>Universidad ORT Uruguay</p>
            <p>© 2025 PLATS - Todos los derechos reservados</p>
        </div>

        <div class="iconos">
            <a href=""><img src="../img/linkedin.svg" alt="linkedin logo"</a>
            <a href=""><img src="../img/tierra.svg" alt="tierra logo"</a>
            <a href=""><img src="../img/instaicon.svg" alt="instagram logo"</a>
        </div>
        <p>Consultas: soporteplats@gmail.com</p>
    </footer>
`;

document.body.insertAdjacentHTML("afterbegin", header);
document.body.insertAdjacentHTML("beforeend", footer);
