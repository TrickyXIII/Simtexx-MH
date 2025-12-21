import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ListaOT from "./pages/ListaOT";
import CrearOT from "./pages/CrearOT";
import DetalleOT from "./pages/DetalleOT";
import ModificarOT from "./pages/ModificarOT";
import Registro from "./pages/Registro";
import MiPerfil from "./pages/MiPerfil";
import GestionUser from "./pages/GestionUser";
import CrearUser from "./pages/CrearUser";
import ModificarUser from "./pages/ModificarUser";
import AuditoriaGlobal from "./pages/AuditoriaGlobal";
import ProtectedRoute from "./utils/auth";

// Importamos estilos globales
import "./styles/global.css";

function App() {
  return (
    /* El #root en global.css ya tiene flex column y min-height */
    <>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas Protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/lista-ot" element={<ProtectedRoute><ListaOT /></ProtectedRoute>} />
          <Route path="/crear-ot" element={<ProtectedRoute><CrearOT /></ProtectedRoute>} />
          <Route path="/detalle/:id" element={<ProtectedRoute><DetalleOT /></ProtectedRoute>} />
          <Route path="/ModificarOT/:id" element={<ProtectedRoute><ModificarOT /></ProtectedRoute>} />
          <Route path="/mi-perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />
          <Route path="/gestion-usuarios" element={<ProtectedRoute><GestionUser /></ProtectedRoute>} />
          <Route path="/CrearUser" element={<ProtectedRoute><CrearUser /></ProtectedRoute>} />
          <Route path="/ModificarUser/:id" element={<ProtectedRoute><ModificarUser /></ProtectedRoute>} />
          <Route path="/auditorias" element={<ProtectedRoute><AuditoriaGlobal /></ProtectedRoute>} />
        </Routes>
      </div>
      {/* El Footer se renderiza dentro de cada página o aquí si es global, 
          pero en tu código actual parece que lo llamas dentro de cada página. 
          Para que el "sticky footer" funcione globalmente, lo ideal sería ponerlo aquí,
          pero si lo mantienes en las páginas, asegúrate de que esas páginas usen .main-content */}
    </>
  );
}

export default App;