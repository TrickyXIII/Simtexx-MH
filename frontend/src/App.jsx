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
import ProtectedRoute from "./components/ProtectedRoute"; 

// Importamos la imagen y estilos
import bgImage from "./assets/fondo-C4YVKjzF.webp";
import "./styles/global.css";

function App() {
  return (
    // Aplicamos el fondo aquí con estilos en línea para asegurar la ruta
    <div className="main-content" style={{ 
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        
        {/* Rutas Protegidas */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/lista-ot" element={<ProtectedRoute><ListaOT /></ProtectedRoute>} />
        <Route path="/crear-ot" element={<ProtectedRoute><CrearOT /></ProtectedRoute>} />
        
        <Route path="/detalle/:id" element={<ProtectedRoute><DetalleOT /></ProtectedRoute>} />
        <Route path="/ModificarOT/:id" element={<ProtectedRoute><ModificarOT /></ProtectedRoute>} />
        
        <Route path="/mi-perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />
        
        <Route path="/GestionUser" element={<ProtectedRoute><GestionUser /></ProtectedRoute>} />
        <Route path="/CrearUser" element={<ProtectedRoute><CrearUser /></ProtectedRoute>} />
        <Route path="/ModificarUser/:id" element={<ProtectedRoute><ModificarUser /></ProtectedRoute>} />
        
        <Route path="/auditoria" element={<ProtectedRoute><AuditoriaGlobal /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;