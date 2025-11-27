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
    
    document.body.insertAdjacentHTML("afterbegin", header);

