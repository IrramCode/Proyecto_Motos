// CONFIGURACIÓN: Tu nueva URL de Render (Sin el slash final)
const API_URL = "https://proyecto-motosapi.onrender.com/api/motos";

// Cargar motos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarMotos();
    cargarCarrito();
    activarTarjetasMarcas();
    const btnComprar = document.getElementById("btnComprar");
    if (btnComprar) {
        btnComprar.addEventListener("click", comprarCarrito);
    }
});

// Funciones para manejar el carrito con localStorage
function obtenerCarrito() {
    const carrito = localStorage.getItem('carrito');
    return carrito ? JSON.parse(carrito) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// 1. LISTAR: Obtener todas las motos desde la API en Render
async function cargarMotos() {
    try {
        const res = await fetch(API_URL);
        const motos = await res.json();
        renderTabla(motos);
    } catch (error) {
        console.error("Error cargando motos:", error);
    }
}

// 2. GUARDAR / ACTUALIZAR: Enviar datos a la API
document.getElementById("motoForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const marca = document.getElementById("marca").value;
    const modelo = document.getElementById("modelo").value;
    const precio = document.getElementById("precio").value;
    const motoId = document.getElementById("motoId").value;

    const motoData = { 
        marca: marca, 
        modelo: modelo, 
        precio: parseFloat(precio) // Aseguramos que sea número
    };

    try {
        let url = API_URL;
        let method = "POST";

        if (motoId !== "") {
            // Si hay ID, es una actualización (PUT)
            url = `${API_URL}/${motoId}`;
            method = "PUT";
            // Incluimos el ID en el cuerpo si tu API lo requiere
            motoData.id = parseInt(motoId);
        }

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(motoData)
        });

        if (res.ok) {
            this.reset();
            document.getElementById("motoId").value = "";
            cargarMotos(); // Recargar la lista
            alert("Operación exitosa");
        }
    } catch (error) {
        console.error("Error guardando moto:", error);
    }
});

// 3. RENDERIZAR: Dibujar las tarjetas en el HTML
function renderTabla(motos) {
    const container = document.getElementById("motoCards");
    if (!container) return;
    container.innerHTML = "";
    
    const formatoMXN = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0
    });

    motos.forEach((moto) => {
        const card = document.createElement("div");
        card.className = "col-xxl-3 col-lg-4 col-md-6 mb-4";

        card.innerHTML = `
            <div class="moto-card h-100 d-flex flex-column justify-content-between">
                <div>
                    <p class="section-eyebrow mb-1">${moto.marca}</p>
                    <h5 class="mb-2">${moto.modelo}</h5>
                    <p class="mb-3">Valor boutique: <strong>${formatoMXN.format(moto.precio)}</strong></p>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-warning flex-grow-1" onclick="editarMoto(${moto.id})">Editar</button>
                    <button class="btn btn-danger flex-grow-1" onclick="eliminarMoto(${moto.id})">Eliminar</button>
                    <button class="btn btn-success add-cart-btn" 
                        data-marca="${moto.marca}" 
                        data-modelo="${moto.modelo}" 
                        data-precio="${moto.precio}">Agregar al carrito</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 4. ELIMINAR: Borrar de la API en Render
async function eliminarMoto(id) {
    if (!confirm("¿Seguro que quieres eliminar esta moto?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        if(res.ok) cargarMotos();
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// 5. EDITAR: Cargar datos en el formulario
async function editarMoto(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const moto = await res.json();

        document.getElementById("marca").value = moto.marca;
        document.getElementById("modelo").value = moto.modelo;
        document.getElementById("precio").value = moto.precio;
        document.getElementById("motoId").value = moto.id;
        
        window.scrollTo(0, 0); // Subir al formulario
    } catch (error) {
        console.error("Error al obtener moto para editar:", error);
    }
}

// --- LÓGICA DEL CARRITO (LocalStorage) ---

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-cart-btn")) {
        e.stopPropagation();
        const marca = e.target.getAttribute("data-marca");
        const modelo = e.target.getAttribute("data-modelo");
        const precio = parseFloat(e.target.getAttribute("data-precio")) || 0;

        agregarMotoCarrito({ marca, modelo, precio });
        alert(`Se agregó "${marca} ${modelo}" al carrito.`);
        cargarCarrito();
    }
});

function agregarMotoCarrito(motoData) {
    const carrito = obtenerCarrito();
    carrito.push({ id: Date.now(), ...motoData });
    guardarCarrito(carrito);
}

function cargarCarrito() {
    const items = obtenerCarrito();
    const container = document.getElementById("carritoCards");
    const badge = document.getElementById("carrito-badge");
    const btnComprar = document.getElementById("btnComprar");
    
    if(!container) return;

    container.innerHTML = "";
    if(badge) badge.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    
    if (btnComprar) {
        btnComprar.disabled = items.length === 0;
    }

    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted text-center w-100">El carrito está vacío</p>';
        return;
    }

    const formatoMXN = new Intl.NumberFormat("es-MX", {
        style: "currency", currency: "MXN", minimumFractionDigits: 0
    });

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "col-xxl-3 col-lg-4 col-md-6 mb-4";
        card.innerHTML = `
            <div class="moto-card h-100 d-flex flex-column justify-content-between" style="border: 2px solid #28a745;">
                <div>
                    <p class="section-eyebrow mb-1">${item.marca}</p>
                    <h5 class="mb-2">${item.modelo}</h5>
                    <p class="mb-3">Valor: <strong>${formatoMXN.format(item.precio)}</strong></p>
                </div>
                <button class="btn btn-danger" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function eliminarDelCarrito(id) {
    const carrito = obtenerCarrito();
    const actualizado = carrito.filter(item => item.id !== id);
    guardarCarrito(actualizado);
    cargarCarrito();
}

// NOTA: Como no tenemos una API de "Compras" en Render, esta función solo limpia el carrito local
async function comprarCarrito() {
    const items = obtenerCarrito();
    if (items.length === 0) return;

    // Aquí podrías crear otra API en Render para Compras si lo deseas, 
    // por ahora simulamos el éxito localmente:
    alert("¡Compra exitosa! Gracias por preferir TWO-WHEELS MOTORS.");
    guardarCarrito([]);
    cargarCarrito();
}

function activarTarjetasMarcas() {
    document.querySelectorAll(".brand-card--with-image").forEach(t => {
        t.addEventListener("click", () => t.classList.toggle("is-active"));
    });
}