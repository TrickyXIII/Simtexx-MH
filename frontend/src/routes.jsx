import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CrearOT from "./pages/CrearOT";
import ListaOT from "./pages/ListaOT";
import DetalleOT from "./pages/DetalleOT";
import ModificarOT from "./pages/ModificarOT";
import CrearUsuario from "./pages/CrearUser";
import Usuarios from "./pages/GestionUser";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/CrearOT/:id" element={<CrearOT />} />
        <Route path="/ListaOT/:id" element={<ListaOT />} />
        <Route path="/detalle/:id" element={<DetalleOT />} />
        <Route path="/ModificarOT/:id" element={<ModificarOT />} />
        <Route path="/CrearUser/" element={<CrearUsuario />} />
        <Route path="/GestionUser/" element={<Usuarios />} />
        
        </Routes>
    </BrowserRouter>
  );
}
