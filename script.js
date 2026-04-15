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

// 1. LISTAR: Obtener todas las motos desde la API .NET
async function cargarMotos() {
    try {
        const res = await fetch("http://localhost:5127/api/motos");
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
        precio: precio.toString() 
    };

    try {
        if (motoId === "") {
            // POST: Nueva moto
            await fetch("http://localhost:5127/api/motos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(motoData)
            });
        } else {
            // PUT: Editar existente
            await fetch(`http://localhost:5127/api/motos/${motoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(motoData)
            });
        }
        
        this.reset();
        document.getElementById("motoId").value = "";
        cargarMotos(); // Recargar la lista
    } catch (error) {
        console.error("Error guardando moto:", error);
    }
});

// 3. RENDERIZAR: Dibujar las tarjetas en el HTML
function renderTabla(motos) {
    const container = document.getElementById("motoCards");
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

// 4. ELIMINAR: Borrar de la API
async function eliminarMoto(id) {
    if (!confirm("¿Seguro que quieres eliminar esta moto?")) return;

    try {
        await fetch(`http://localhost:5127/api/motos/${id}`, {
            method: "DELETE"
        });
        cargarMotos();
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// 5. EDITAR: Cargar datos en el formulario
async function editarMoto(id) {
    try {
        const res = await fetch(`http://localhost:5127/api/motos/${id}`);
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
    badge.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
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

async function comprarCarrito() {
    const items = obtenerCarrito();
    if (items.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/compras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });

        if (!res.ok) {
            throw new Error("No se pudo registrar la compra.");
        }

        guardarCarrito([]);
        cargarCarrito();
        alert("compra exitosa");
    } catch (error) {
        console.error("Error al comprar:", error);
        alert("No se pudo completar la compra.");
    }
}

function activarTarjetasMarcas() {
    document.querySelectorAll(".brand-card--with-image").forEach(t => {
        t.addEventListener("click", () => t.classList.toggle("is-active"));
    });
}