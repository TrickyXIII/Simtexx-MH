// Simulación del tipo de usuario logeado (cámbialo para probar)
const loggedUser = {
    role: "admin", 
    id: 1  // <-- el ID del usuario logeado
};

// Simulación de datos de una API
let otData = [
    {
        id: 1,
        descripcion: "Contrato de Mantención Eléctrica",
        estado: "En Proceso",
        fechaInicio: "2024-01-10",
        fechaFin: "2024-03-10",
        responsable: 1
    },
    {
        id: 2,
        descripcion: "Contrato de Equipos Informáticos",
        estado: "Pendiente",
        fechaInicio: "2024-02-05",
        fechaFin: "2024-05-05",
        responsable: 2
    },
    {
        id: 3,
        descripcion: "Contrato de Limpieza Industrial",
        estado: "Finalizado",
        fechaInicio: "2023-10-01",
        fechaFin: "2024-01-01",
        responsable: 1
    }
];

// Función principal para cargar OT
function cargarOT() {
    const tbody = document.getElementById("otTableBody");
    tbody.innerHTML = "";

    let datosFiltrados = otData;

    // Criterio: User solo ve sus OT
    if (loggedUser.role === "User") {
        datosFiltrados = datosFiltrados.filter(ot => ot.responsable === loggedUser.id);
    }

    datosFiltrados.forEach(ot => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${ot.id}</td>
            <td>${ot.descripcion}</td>
            <td>${ot.estado}</td>
            <td>${ot.fechaInicio}</td>
            <td>${ot.fechaFin}</td>
            <td>${ot.responsable}</td>
        `;
        tbody.appendChild(row);
    });
}

// Refrescar manualmente
document.getElementById("refreshBtn").addEventListener("click", cargarOT);

// Auto actualización cada 10 segundos
setInterval(() => {
    console.log("Actualizando datos...");
    cargarOT();
}, 10000);

// Cargar al iniciar
cargarOT();
