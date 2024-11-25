'use strict';

class Album {
    constructor(nombre, artista, codigo, portada) {
        this.nombre = nombre;
        this.artista = artista;
        this.codigo = codigo;
        this.portada = portada;
        this.pistas = [];
    }

    agregarPista(pista) {
        this.pistas.push(pista);
    }

    duracionTotal() {
        return this.pistas.reduce((total, pista) => total + pista.duracion, 0);
    }
    pistaMasLarga() {
        let maximo = this.pistas[0];
        for (let i = 1; i < this.pistas.length; i++) {
            if (this.pistas[i].duracion > maximo.duracion) {
                maximo = this.pistas[i];
            }
        }
        return maximo;
    }

    duracionPromedio() {
        const promedio = this.duracionTotal() / this.pistas.length || 0;
        return parseFloat(promedio.toFixed(2)); 
    }

    tiempo(segundos) {
        const hs = Math.floor(segundos / 3600);
        const min = Math.floor((segundos % 3600) / 60);
        const seg = segundos % 60;
        return `${hs.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
    }

    toHTML() {
        let html = `
            <div class="album-card">
                <div class="card" style="width: 18rem;">
                    <img src="${this.portada}" class="album">
                    <div class="card-body">
                        <h3 class="card-title">${this.nombre}</h3>
                        <p class="nombre_artista">${this.artista}</p>
                        <p class="disco_id">Código: ${this.codigo}</p>
                        <ul class="lista-canciones">`;
    
        this.pistas.forEach(pista => {
            const duracionFormateada = this.tiempo(pista.duracion);
            const color = pista.duracion > 180 ? 'text-success' : '';
            html += `<li class="${color}">${pista.nombre} - ${duracionFormateada}</li>`;
        });
    
        html += `
                        </ul>
                        <p>Duración total: ${this.tiempo(this.duracionTotal())}</p>
                        <p>Pista más larga: ${this.pistaMasLarga().nombre} - ${this.tiempo(this.pistaMasLarga().duracion)}</p>
                        <p>Promedio de duración: ${this.tiempo(this.duracionPromedio())}</p>
                    </div>
                </div>
            </div>`;
        return html;
    }
}

class Pista {
    constructor(nombre, duracion) {
        this.nombre = nombre;
        this.duracion = duracion;
    }
}

let discoscargados = [];

function cargar() {
    const nombre = pedirDato("Ingrese el nombre del disco:");
    const artista = pedirDato("Ingrese el nombre del artista o de la banda:");
    const codigo = pedirCodigo();
    const portada = pedirDato("Ingrese el URL de la portada:");
    const nuevoAlbum = new Album(nombre, artista, codigo, portada);

    do {
        const nombrePista = pedirDato("Ingrese el nombre de la pista:");
        const duracionPista = pedirDuracion();
        nuevoAlbum.agregarPista(new Pista(nombrePista, duracionPista));
    } while (confirm("¿Desea seguir cargando pistas?"));

    discoscargados.push(nuevoAlbum);
    alert(`El disco "${nombre}" fue agregado al sistema.`);
    actualizarContadorDiscos();
}

function mostrar() {
    const contenedor = document.getElementById("discos");
    contenedor.innerHTML = discoscargados.map(album => album.toHTML()).join('');
    ContadorDiscos();
}

/* VALIDACIONES */
function buscar_id() {
    const codigo = parseInt(prompt("Ingrese el código del disco a buscar:"));
    const disco = discoscargados.find(album => album.codigo === codigo);
    const contenedor = document.getElementById("discos");

    if (disco) {
        contenedor.innerHTML = disco.toHTML();
        alert(`Disco encontrado:\nNombre: ${disco.nombre}\nArtista: ${disco.artista}`);
    } else {
        alert("No se encontró un disco con ese código.");
    }
}

function pedirDato(msg) {
    let dato;
    do {
        dato = prompt(msg);
        if (!dato || dato.trim() === "") {
            alert("Por favor, complete el campo.");
        } else {
            return dato.trim();
        }
    } while (true);
}

function pedirCodigo() {
    let codigo;
    do {
        codigo = parseInt(prompt("Ingrese el código numérico único del disco (entre 1 y 999):"));
        if (isNaN(codigo) || codigo < 1 || codigo > 999) {
            alert("El código debe ser un número entre 1 y 999.");
        } else if (discoscargados.some(album => album.codigo === codigo)) {
            alert("Este código ya fue ingresado. Por favor, ingrese otro.");
        } else {
            return codigo;
        }
    } while (true);
}

function pedirDuracion() {
    let duracion;
    do {
        duracion = parseInt(prompt("Ingrese la duración de la pista en segundos (entre 0 y 7200):"));
        if (isNaN(duracion) || duracion < 0 || duracion > 7200) {
            alert("La duración debe ser un número entre 0 y 7200.");
        } else {
            return duracion;
        }
    } while (true);
}

function ContadorDiscos() {
    const contador = document.getElementById("contadorDiscos");
    contador.innerHTML = `<p>Discos cargados: ${discoscargados.length}</p>`;
}

function Cargar_json() {
    fetch('discos.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            data.forEach(disco => {
                const nuevoAlbum = new Album(disco.nombre, disco.artista, disco.codigo, disco.portada);
                disco.pistas.forEach(pista => {
                    nuevoAlbum.agregarPista(new Pista(pista.nombre, pista.duracion));
                });
                discoscargados.push(nuevoAlbum);
            });
            mostrar(); 
        })
        .catch(error => {
            console.error("Error al cargar discos del JSON:", error);
            alert("Hubo un error al cargar los discos.");
        });
}

function ordenarDiscos(orden) {
    if (orden === 'asc') {
        discoscargados.sort((a, b) => a.duracionTotal() - b.duracionTotal());
    } else if (orden === 'desc') {
        discoscargados.sort((a, b) => b.duracionTotal() - a.duracionTotal());
    }
    mostrar();
}


document.getElementById('ordenarSelect').addEventListener('change', function () {
    ordenarDiscos(this.value);
});